var redis   = require('redis');
var Promise = require('bluebird');
var async   = require('async');
var Group   = require('./lib/group');
var User    = require('./lib/user');

exports = module.exports = Rollout;
exports.Group = Group;
exports.User  = User;

/**
 * An optional helper for creating a new Rollout instance.
 *
 * @param {Redis} redis A redis instance.
 */

exports.create = function(redis) {
  return new Rollout(redis);
};

/**
 * Rollout constructor.
 *
 * @param {Redis} client A redis instance.
 */

function Rollout(client) {
  this.client     = client || redis.createClient();
  this._id        = 'id';
  this._namespace = null;
  this._groups    = {};

  this.group('all', function(user) { return true; });
}

/**
 * Let Rollout know which key the id is on a user object.
 *
 * @param {String} id The key that defines the id of a user.
 * @return {Rollout}
 * @chainable
 */

Rollout.prototype.id = function(id) {
  this._id = id;
  return this;
};

/**
 * Return the name of the key. This takes namespaces into account.
 *
 * @param {String} key
 * @return {String}
 */

Rollout.prototype.name = function(key) {

  if (!key) {
    throw new Error("The key isn't defined. .name() requires a single parameter.");
  }

  if (this._namespace) {
    key = this._namespace + ':' + key;
  }

  return key;
};

/**
 * Define a new namespace. This is useful for keeping multiple Rollout instances
 * while using the same Redis host.
 *
 * @param {String} name The namespace's name.
 * @return {Rollout}
 * @chainable
 */

Rollout.prototype.namespace = function(name) {

  if (arguments.length != 1) {
    throw new Error(".namespace() only expects a single parameter.");
  }

  if ('string' !== typeof name) {
    throw new Error(".namespace() expected a string as it's first parameter.");
  }

  this._namespace = name;

  // Redefine the :all group.
  this.group('all', function(user) { return true; });

  return this;
};

/**
 * Check whether a feature is activated or not. An optional user ID can be provided
 * to bind the feature to that user.
 *
 * By default, we check the global status of the feature. If that returns false,
 * we can further check for the provided user, only if it's provided.
 *
 * @param {String} feature
 * @param {String/Integer/Object} user
 * @return {Promise}
 */

Rollout.prototype.active = function(feature) {
  var self = this;
  
  if (arguments.length === 0) {
    throw new Error("The .active() method needs a feature name as it's first parameter.");
  }

  return this.group('all').activate(feature);
};

/**
 * User
 */

Rollout.prototype.user = function(user) {
  return User.create(user, this);
};

/**
 * Define a new group.
 *
 * @param {String} name The group name.
 * @param {Function} fn Callback.
 */

Rollout.prototype.group = function(name, fn) {
  var self = this;

  if (fn) {
    if ('function' !== typeof fn) {
      throw new Error("Expected .group()'s second param to be a function.");
    }

    var group = Group.create(name, this);
    this._groups[name] = group;

    self.client.sadd(self.name('rollout:groups'), name, function(err, result) {});
    return group;
  }

  return this._groups[name];  
};

/**
 * Global feature deactivator
 *
 * @param {String} feature Feature name.
 * @return {Promise}
 */

Rollout.prototype.deactivate = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var name = self.name('rollout:users');
    // Fetch all the users.
    self.client.smembers(name, function(err, users) {
      if (err) {
        return reject(err);
      }

      var fns = [];

      users.forEach(function(user) {
        if (user == null) return cb();
        fns.push(function(cb) {
          self.client.srem(self.name('rollout:users:' + user), feature, function(err, result) {
            cb(err);
          });
        });
      });

      async.parallel(fns, function(err, result) {
        if (err) return reject(err);
        resolve();
      });
    });
  }).then(function() {

    var fns    = [];

    for(var key in self._groups) {
      var group = self._groups[key];
      fns.push(function(cb) {
        var name = self.name('rollout:groups:' + group.name);
        self.client.srem(name, feature, function(err, result) {
          cb(err);
        });
      });
    }

    return new Promise(function(resolve, reject) {
      async.parallel(fns, function(err, results) {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  });
};