var redis   = require('redis');
var Promise = require('bluebird');
var app     = require('./lib/app');

exports = module.exports = Rollout;

exports.create = function(redis) {
  return new Rollout(redis);
};

/**
 * Export the express app;
 */

exports.createApp = function(instance) {
  return app(instance);
};

/**
 * Rollout constructor.
 *
 *  `feature_status`
 *
 */

function Rollout(client) {
  if (!client) {
    throw new Error("The Rollout constructor requires a redis client as a parameter.");
  }
  this.client = client;
}


Rollout.prototype.isEnabled = function(feature) {
  var self = this;

  return new Promise(function(resolve, reject) {
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