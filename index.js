/**
 * Module dependencies.
 */

var redis = require('redis');
var Promise = require('bluebird');

/**
 * Module exports.
 */

exports = module.exports = Flip;

/**
 * Flip constructor.
 *
 *  `feature_status`
 *
 */

function Flip(options) {
  if (!options) options = {};
  this.host = options.host;
  this.port = options.port;
  this.username = options.username;
  this.password = options.password;
  this.client = redis.createClient(this.port || 6379, this.host || '127.0.0.1');
}

/**
 * featureEnabled?
 */

Flip.prototype.isEnabled = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject)
  {
    self.client.hget('feature_status', feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      if (result == null) {
        self.client.hset(['feature_status', feature, 'disabled'], function() {
          return resolve(false);
        })
      }
      console.log(result);
      if (result === 'enabled') {
        return resolve(true);
      } else {
        return resolve(false);
      }

    });
  });

};

/**
 * Enable
 */

Flip.prototype.enable = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject)
  {
    self.client.hset(['feature_status', feature, 'enabled'], function(err, r) {
      return resolve();
    });
  });
};


/**
 * Disable
 */

Flip.prototype.disable = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject)
  {
    self.client.hset(['feature_status', feature, 'disabled'], function(err) {
      return resolve();
    });
  });
};