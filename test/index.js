var Rollout = require('..');
var assert  = require('assert');
var Promise = require('bluebird');

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

  it('should have an .active() method', function() {
    assert.equal('function', typeof Rollout.create().active);
  });

  it('should throw an error when calling .active() without any arguments', function() {
    var rollout = Rollout.create();

    assert.throws(function() {
      rollout.active();
    }, Error);

  });

  it('should allow a call to .active() without a user ID.', function() {
    var rollout = Rollout.create();

    assert.doesNotThrow(function() {
      rollout.active('foo');
    }, "Expected .active() to have an *optional* user ID argument.");
  });

  it('should return a new promise when calling .active()', function() {
    var rollout = Rollout.create();

    assert(rollout.active('foo') instanceof Promise);
  });

  it('should return "disabled" when a feature hasn\'t been set', function(done) {
    var rollout = Rollout.create();

    rollout.active('foobar').then(function(result) {
      assert.equal(result, false);
      done();
    });
  });

  it('should have a .isActiveUser() method', function() {
    var rollout = Rollout.create();
    assert.equal('function', typeof rollout.isActiveUser);
  });

  it('should throw an error when calling `isActiveUser` without arguments', function() {
    var rollout = Rollout.create();

    assert.throws(function() {
      rollout.isActiveUser();
    }, Error);

    assert.throws(function() {
      rollout.isActiveUser(1);
    }, Error);

    assert.throws(function() {
      rollout.isActiveUser(1,2,3);
    }, Error);
  });

  it('should throw an error when calling `isActive` without arguments', function() {
    var rollout = Rollout.create();

    assert.throws(function() {
      rollout.isActive();
    }, Error);
  });

  it('should be disabled when calling `.isActive` for the first time', function(done) {
    var rollout = Rollout.create();

    rollout.isActive('woot').then(function(enabled) {
      assert.equal(enabled, false);
      done();
    });
  });

  it('should return a new promise when calling .isActiveUser()', function() {
    var rollout = Rollout.create();

    assert(rollout.isActiveUser('foobar123', 1) instanceof Promise);
  });

});