var Rollout = require('..');
var assert  = require('assert');
var Promise = require('bluebird');

describe('rollout', function() {

  describe('constructor', function() {
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

    it('should have a default user id of "id"', function() {
      assert.equal(Rollout.create()._id, 'id');
    });

    it('should define a custom id', function() {
      var rollout = Rollout.create();
      rollout.id('foo');
      assert.equal(rollout._id, 'foo');
    });

    it('should return a chainable interface (.id())', function() {
      var rollout = Rollout.create();
      assert(rollout.id() instanceof Rollout);
    });
  });

  describe('.active()', function() {
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
  });

  describe('.isActiveUser()', function() {
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

    it('should return a new promise when calling .isActiveUser()', function() {
      var rollout = Rollout.create();

      assert(rollout.isActiveUser('foobar123', 1) instanceof Promise);
    });

  });

  describe('.isActive()', function() {

    it('should define an .isActive() method', function() {
      var rollout = Rollout.create();
      assert.equal('function', typeof rollout.isActive);
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
  });


  describe('activate user', function() {
    it('should define an .activateUser() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.activateUser);
    });

    it('should throw an error when passing less than two params.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.activateUser();
      });

      assert.throws(function() {
        rollout.activateUser('foo');
      });

    });

    it('should activate a feature for a specific user', function(done) {
      var rollout = Rollout.create();

      rollout.activateUser('FooBar', 10).then(function() {
        return rollout.isActiveUser('FooBar', 10);
      }).then(function(enabled) {
        assert.equal(enabled, true);
        done();
      });
    });

  });

  describe('deactivate user', function() {
    it('should define an .deactivateUser() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.deactivateUser);
    });

    it('should throw an error when passing less than two params.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.deactivateUser();
      });

      assert.throws(function() {
        rollout.deactivateUser('foo');
      });

    });

    it('should deactivate a feature for a specific user', function(done) {
      var rollout = Rollout.create();

      rollout.deactivateUser('FooBar', 10).then(function() {
        return rollout.isActiveUser('FooBar', 10);
      }).then(function(enabled) {
        assert.equal(enabled, false);
        done();
      });
    });

  });


  describe('groups', function() {
    it('should define a .group() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.group);
    });

    it('should throw an error when calling .group() without any params.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.group();
      }, Error);
    });

    it('should throw an error when calling .group() with too many params.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.group(1,2,3,4);
      }, Error);
    });

    it('should not throw when calling .group() with two params', function() {
      var rollout = Rollout.create();

      assert.doesNotThrow(function() {
        rollout.group('all', function() {});
      });
    });

    it('should throw an error when the second param to .group() isn\'t a function', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.group('all', 123);
      }, Error);
    });

  });

});