var Promise = require('bluebird');
var async   = require('async');

exports = module.exports = User;

exports.create = function(name, rollout) {
  return new User(name, rollout);
};

/**
 * User constructor
 */

function User(user, rollout) {
  if (!user || !rollout) {
    throw new Error("The User constructor expected two params.");
  }

  this.user    = user;
  this.rollout = rollout;
}

/**
 * Active
 */

User.prototype.active = function(feature) {
  var self = this;

  if (!feature) {
    throw new Error("Expected a feature name.");
  }

  return new Promise(function(resolve, reject) {
    var name = self.rollout.name('rollout:groups:' + self.name);
    self.rollout.client.sismember(name, feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      if (result === 1) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

/**
 * Activate
 */

User.prototype.activate = function(feature) {
  var self = this;

  if (!feature) {
    throw new Error("Expected a feature.");
  }

  return new Promise(function(resolve, reject) {
    var name = self.rollout.name('rollout:groups:' + self.name);
    self.rollout.client.sadd(name, feature, function(err, result) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};