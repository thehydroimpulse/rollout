var Promise = require('bluebird');

exports = module.exports = Group;

exports.create = function(name, rollout) {
  return new Group(name, rollout);
};

/**
 * Group constructor
 */

function Group(name, rollout) {
  if (!name || !rollout) {
    throw new Error("The Group constructor expected two params.");
  }

  this.name    = name;
  this.rollout = rollout;
  this._fn      = function() {};
}

/**
 * Define a function
 */

Group.prototype.fn = function(fn) {

  if (!fn || 'function' !== typeof fn) {
    throw new Error("Expected a function.");
  }

  this._fn = fn;
  return this;
};

/**
 * Active
 */

Group.prototype.active = function(feature) {
  var self = this;

  if (!feature) {
    throw new Error("Expected a feature name.");
  }

  return new Promise(function(resolve, reject) {

  });
};