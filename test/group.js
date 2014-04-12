var Rollout = require('..');
var assert  = require('assert');
var Promise = require('bluebird');
var Group   = Rollout.Group;

describe('groups', function() {

  it('should export a function', function() {
    assert.equal('function', typeof Group);
  });

  it('should return a new Group instance', function() {
    assert(Group.create() instanceof Group);
  });

});