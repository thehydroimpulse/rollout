var redis   = require('redis');
var Promise = require('bluebird');
var Group   = require('./lib/group');

exports = module.exports = Rollout;
exports.Group = Group;

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
 * Check whether a specific user has a feature enabled.
 *
 * @param {String} feature
 * @param {String/Integer} id
 */

Rollout.prototype.isActiveUser = function(feature, id) {

  var self = this;

  if (arguments.length !== 2) {
    throw new Error(".isActiveUser() requires two parameters.");
  }

  return new Promise(function(resolve, reject) {
    var name = self.name('rollout:user:' + id);
    self.client.hget(name, feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      if (result === 'enabled') {
        resolve(true);
      } else if (result === 'disabled') {
        resolve(false);
      } else {
        resolve(null);
      }
    });
  });
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

Rollout.prototype.active = function(feature, user) {
  var self = this;
  var id   = user;

  if (arguments.length === 0) {
    throw new Error("The .active() method needs at least a feature name as it's first parameter.");
  }

  if ('object' === typeof user) {
    id = user[this._id];
  }

  // We only need to check for the :all group.
  if (!user) {
    return this.activateGroup(feature, 'all');
  }
  
};

/**
 * Activate a feature for a given user.
 *
 * @param {String} feature
 * @param {String/Integer} user
 * @return {Promise}
 */

Rollout.prototype.activateUser = function(feature, user) {
  var self = this;

  if (arguments.length < 2) {
    throw new Error(".activateUser() requires at least two parameters.");
  }

  return new Promise(function(resolve, reject) {
    var name = self.name('rollout:user:' + user);
    self.client.hset(name, feature, 'enabled', function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};


/**
 * Deactive a feature for a given user.
 *
 * @param {String} feature
 * @param {String/Integer/Object} user
 * @return {Promise}
 */

Rollout.prototype.deactivateUser = function(feature, user) {
  var self = this;
  var id   = user;

  if (arguments.length < 2) {
    throw new Error(".activateUser() requires at least two parameters.");
  }

  if ('object' === typeof user) {
    id = user[this._id];
  }

  return new Promise(function(resolve, reject) {
    var name = self.name('rollout:user:' + id);
    self.client.hset(name, feature, 'disabled', function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

/**
 * Define a new group.
 *
 * @param {String} group The group name.
 * @param {Function} fn Callback.
 */

Rollout.prototype.group = function(group, fn) {
  var self = this;

  if (arguments.length !== 2) {
    throw new Error(".group() expected 2 parameters.");
  }

  if ('function' !== typeof fn) {
    throw new Error("Expected .group()'s second param to be a function.");
  }

  this._groups[group] = fn;

  return new Promise(function(resolve, reject) {
    var name = self.name('rollout:groups');
    self.client.sadd(name, group, function(err, result) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

/**
 * ActiveGroup
 */

Rollout.prototype.activeGroup = function(feature, group) {

};

/**
 * Activate group
 */

Rollout.prototype.activateGroup = function(feature, group) {
  var self = this;

  if (arguments.length !== 2) {
    throw new Error(".activateGroup() requires two parameters.");
  }

  if ('string' !== typeof feature || 'string' !== typeof group) {
    throw new Error("Expected the two parameters to be strings.");
  }

  if (!this._groups[group]) {
    throw new Error('The group (' + group + ') has not been defined.');
  }

  return new Promise(function(resolve, reject) {
    var name = self.name('rollout:groups:' + group);
    self.client.sadd(name, feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

/**
 * Deactivate a single feature from a single group.
 *
 * @param {String} feature
 * @param {String} group
 * @return {Promise}
 */

Rollout.prototype.deactivateGroup = function(feature, group) {
  var self = this;

  if (arguments.length !== 2) {
    throw new Error(".deactivateGroup() expected two arguments.");
  }

  if ('string' !== typeof feature || 'string' !== typeof group) {
    throw new Error(".deactivateGroup() expected two string arguments.");
  }

  if (!this._groups[group]) {
    throw new Error('The group (' + group + ') doesn\'t exist.');
  }

  return new Promise(function(resolve, reject) {

  });
};