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
 * Export the express app;
 *
 * @param {Rollout} instance A Rollout instance.
 * @return {App} An express app instance.
 */

exports.createApp = function(instance) {
  //return app(instance);
};

/**
 * Rollout constructor.
 *
 * @param {Redis} client A redis instance.
 */

function Rollout(client) {
  if (!client) client = redis.createClient();
  this.client = client;
}

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

  if (!id && !feature) {
    throw new Error("The .active() method needs at least a feature name as it's first parameter.");
  }

  return new Promise(function(resolve, reject) {
    this.client.hget('feature_rollout_global', feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      if (result == null) {
        self.client.hset(['feature_status', feature, 'disabled'], function() {
          return resolve(false);
        })
      }

      if (result === 'enabled') {
        return resolve(true);
      } else {
        return resolve(false);
      }

    });
  }.bind(this));
};

Rollout.prototype.enable = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.client.hset(['feature_status', feature, 'enabled'], function(err, r) {
      return resolve();
    });
  });
};


Rollout.prototype.disable = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.client.hset(['feature_status', feature, 'disabled'], function(err) {
      return resolve();
    });
  });
};

Rollout.prototype.list = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.client.hgetall('feature_status', function(err, keys) {
      if (err) {
        return reject(err);
      }

      resolve(keys);
    });
  });
};


Rollout.prototype.flip = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // Get the current value;
    self.isEnabled(feature).then(function(enabled) {
      if (enabled) {
        return self.disable(feature).then(function() {
          return resolve('enabled');
        });
      } else {
        return self.enable(feature).then(function()
        {
          return resolve('disabled');
        });
      }
    });
  });
};

Rollout.prototype.define = function(feature, def) {
  var self = this;

  if (!def) def = false;

  return new Promise(function(resolve, reject) {
    self.client.hget('feature_status', feature, function(err, result) {
      if (result == null) {
        if (def === false) {
          return self.disable(feature).then(resolve);
        } else {
          return self.enable(feature).then(resolve);
        }
      }
    });
  });
};