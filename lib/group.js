exports = module.exports = Group;

exports.create = function(name, rollout) {
  return new Group(name, rollout);
};

/**
 * Group constructor
 */

function Group(name, rollout) {
  this.name = name;
  this.rollout = rollout
}