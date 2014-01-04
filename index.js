/**
 * Module dependencies.
 */

var redis = require('redis');
var Promise = require('bluebird');
var app = require('./lib/app');

/**
 * Module exports.
 */

exports = module.exports = Flip;

/**
 * Export the express app;
 */

exports.createApp = function(instance) {
  return app(instance);
};

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

/**
 * List Features
 */

Flip.prototype.list = function() {
  var self = this;

  return new Promise(function(resolve, reject)
  {
    self.client.hgetall('feature_status', function(err, keys)
    {
      if (err) {
        return reject(err);
      }

      resolve(keys);
    });
  });
};

/**
 * Flip
 */

Flip.prototype.flip = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject)
  {
    // Get the current value;
    self.isEnabled(feature).then(function(enabled)
    {
      if (enabled) {
        return self.disable(feature).then(function()
        {
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

/**
 * Define
 */

Flip.prototype.define = function(feature, def) {
  var self = this;

  if (!def) def = false;

  return new Promise(function(resolve, reject)
  {
    self.client.hget('feature_status', feature, function(err, result)
    {
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