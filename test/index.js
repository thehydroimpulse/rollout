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

    it('should be enabled the second time', function() {
      var rollout = Rollout.create();

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

    it('should add a member to the rollout:groups set', function(done) {
      var rollout = Rollout.create();

      rollout.group('foobar', function(user) {

      }).then(function() {
        rollout.client.sismember('rollout:groups', 'foobar', function(err, result) {
          if (err) {
            return done(err);
          }

          if (result == '1') {
            done();
          } else {
            done(err);
          }
        });
      });
    });

    it('should add a default group of all', function(done) {
      var rollout = Rollout.create();

      setTimeout(function() {
        rollout.client.sismember('rollout:groups', 'all', function(err, result) {
          if (err) {
            return done(err);
          }

          if (result == '1') {
            done();
          } else {
            done(err);
          }
        });
      }, 10);
    });

  });


  describe('namespace', function() {
    it('should define a .namespace() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.namespace);
    });

    it('should throw an error without any arguments', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.namespace();
      }, Error);
    });

    it('should throw an error with too many arguments', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.namespace(1,2,3);
      });
    });

    it('should throw if single param isn\'t a string', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.namespace(1);
      });
    });

    it('should be a chainable method', function() {
      var rollout = Rollout.create();

      assert(rollout.namespace('foobar') instanceof Rollout);
    });

    it('should define the default "all" group with a namespace', function(done) {
      var rollout = Rollout.create().namespace('foobar');

      setTimeout(function() {
        rollout.client.sismember('foobar:rollout:groups', 'all', function(err, result) {
          if (err) {
            return done(err);
          }

          if (result == '1') {
            done();
          } else {
            return done(err);
          }

        });
      }, 30);
    });
  });

  describe('.activateGroup()', function() {

    it('should define an .activateGroup() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.activateGroup);
    });

    it('should throw an error if missing parameters.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.activateGroup();
      }, Error);
 

      assert.throws(function() {
        rollout.activateGroup('foo');
      }, Error);

      assert.throws(function() {
        rollout.activateGroup('foo', 'fah', 'foo');
      }, Error);
    });

    it('should throw an error if the params aren\'t strings', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.activateGroup(123, 555);
      });
    });

    it('should throw an error if the group hasn\'t been defined', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.activateGroup('feature', 'fooo');
      }, Error);
    });

    it('should return a promise', function() {
      var rollout = Rollout.create();

      assert(rollout.activateGroup('feature', 'all') instanceof Promise);
    });

    it('should add the feature to the group\'s set', function(done) {
      var rollout = Rollout.create();

      rollout.activateGroup('login', 'all').then(function() {
        rollout.client.sismember(rollout.name('rollout:groups:all'), 'login', function(err, result) {
          if (err) {
            return done(err);
          }

          if (result === 1) {
            done();
          } else {
            done(true);
          }
        });
      });
    });

  });

  describe('.name()', function() {
    it('should define a .name() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.name);
    });

    it('should throw an error if the key isn\'t defined', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.name();
      }, Error);
    });

    it('should return a string', function() {
      var rollout = Rollout.create();

      assert.equal('string', typeof rollout.name('foo'));
    });

    it('should return the name with a prepended namespace', function() {
      var rollout = Rollout.create().namespace('faf');

      assert.equal(rollout.name('heh'), 'faf:heh');
    });
  });

  describe('deactivateGroup()', function() {

    it('should define the method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.deactivateGroup);
    });

    it('should return a promise', function() {
      var rollout = Rollout.create();

      assert(rollout.deactivateGroup('a', 'all') instanceof Promise);
    });

    it('should throw an error on invalid number of args.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.deactivateGroup();
      }, Error);


      assert.throws(function() {
        rollout.deactivateGroup('hello');
      }, Error);


      assert.throws(function() {
        rollout.deactivateGroup('hello', 'two', 'four');
      }, Error);
    });

    it('should throw an error if passed non-strings', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.deactivateGroup(1,2);
      }, Error);
    });

    it('should throw an error if the group doesn\'t exist.', function() {
      var rollout = Rollout.create();

      assert.throws(function() {
        rollout.deactivateGroup('foo', 'bar123');
      }, Error);
    });
  });

});