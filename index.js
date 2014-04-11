var redis   = require('redis');
var Promise = require('bluebird');

exports = module.exports = Rollout;

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
  this.client = client || redis.createClient();
  this._id = 'id';
}

/**
 * Let Rollout know which key the id is on a user object.
 */

Rollout.prototype.id = function(id) {
  this._id = id;
  return this;
};

/**
 * Check globally whether a feature is activated or not.
 *
 * @param {String} feature
 * @return {Promise}
 */

Rollout.prototype.isActive = function(feature) {
  var self = this;

  if (!feature) {
    throw new Error("Expected 1 parameter for .isActive().");
  }

  return new Promise(function(resolve, reject) {
    self.client.hget('rollout:global', feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      if (result === 'enabled') {
        return resolve(true);
      } else {
        return resolve(false);
      }

    });
  });
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
    self.client.hget('rollout:user:' + id, feature, function(err, result) {
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
 * @param {String/Integer} id
 * @return {Promise}
 */

Rollout.prototype.active = function(feature, id) {
  var self = this;

  if (arguments.length === 0) {
    throw new Error("The .active() method needs at least a feature name as it's first parameter.");
  }

  if (arguments.length === 1) {
    return this.isActive(feature);
  } else {
    return this.isActive(feature).then(function(enabled) {
      if (enabled || enabled == null) {
        return self.isActiveUser(feature, id);
      }

      return new Promise(function(resolve) { resolve(); });
    });
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
    self.client.hset('rollout:user:' + user, feature, 'enabled', function(err) {
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
    self.client.hset('rollout:user:' + id, feature, 'disabled', function(err) {
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
 * @param {String} name The group name.
 * @param {Function} fn Callback.
 */

Rollout.prototype.group = function(name, fn) {
  var self = this;

  if (arguments.length !== 2) {
    throw new Error(".group() expected 2 parameters.");
  }

  if ('function' !== typeof fn) {
    throw new Error("Expected .group()'s second param to be a function.");
  }

  return new Promise(function(resolve, reject) {
    self.client.sadd('rollout:groups', name, function(err, result) {
      if (err) {
        return reject(err);
      }
    });
  });
};