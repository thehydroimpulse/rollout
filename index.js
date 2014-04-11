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
  var self = this;

  if (arguments.length === 0) {
    throw new Error("The .active() method needs at least a feature name as it's first parameter.");
  }

  return new Promise(function(resolve, reject) {
    self.client.hget('feature_rollout_global', feature, function(err, result) {
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
  });
};