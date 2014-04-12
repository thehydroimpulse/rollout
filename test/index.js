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

    it('should return a new promise when calling .active()', function() {
      var rollout = Rollout.create();

      assert(rollout.active('foo') instanceof Promise);
    });

    it.skip('should return "disabled" when a feature hasn\'t been set', function(done) {
      var rollout = Rollout.create();

      rollout.active('foobar').then(function(result) {
        assert.equal(result, false);
        done();
      });
    });
  });

  describe('groups', function() {
    it('should define a .group() method', function() {
      var rollout = Rollout.create();

      assert.equal('function', typeof rollout.group);
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

      var group = rollout.group('foobar', function(user) {
        return true;
      });

      setTimeout(function() {
        rollout.client.sismember(rollout.name('rollout:groups'), 'foobar', function(err, result) {
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

});