var Rollout = require('..');
var assert  = require('assert');

describe('rollout', function() {

  it('should return a function', function() {
    assert.equal('function', typeof Rollout);
  });

  it('should return a .create function', function() {
    assert.equal('function', typeof Rollout.create);
  });

  it('should default to a local Redis instance when one isn\'t provided', function() {
    assert.doesNotThrow(function() {
      var rollout = new Rollout();
    }, "Expected Rollout() to default to a local Redis instance.");
  });

  it('should create a new Rollout instance w/ .create()', function() {
    assert(Rollout.create() instanceof Rollout);
  });

});