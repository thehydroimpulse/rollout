var Rollout = require('..');
var assert  = require('assert');
var Promise = require('bluebird');
var Group   = Rollout.Group;

describe('groups', function() {

  it('should export a function', function() {
    assert.equal('function', typeof Group);
  });

  it('should return a new Group instance', function() {
    assert(Group.create(1,2) instanceof Group);
  });

  it('should throw without two params', function() {
    assert.throws(function() {
      Group.create();
    }, Error);

    assert.throws(function() {
      Group.create('foo');
    }, Error);
  });

  describe('.fn', function() {

    it('should define a fn function', function() {
      assert.equal('function', typeof Group.prototype.fn);
    });

    it('should define a function', function() {
      var rollout = Rollout.create();
      var group   = Group.create('fivve', rollout).fn(function() { return 1; });
      assert.equal('function', typeof group._fn);
      assert.equal(1, group._fn());
    });

    it('should return a Group instance', function() {
      var rollout = Rollout.create();
      var group   = Group.create('fivve', rollout);

      assert(group.fn(function() {}) instanceof Group);
    });

    it('should throw if not a function', function() {
      var rollout = Rollout.create();
      var group   = Group.create('fivve', rollout);

      assert.throws(function() {
        group.fn(123);
      });
    });

  });

  describe('.active', function() {

    beforeEach(function() {
      this.rollout = Rollout.create();
      this.group   = Group.create('foo', this.rollout);
    });

    it('should define fn', function() {
      assert.equal('function', typeof this.group.active);
    });

    it('should throw an error without a feature name', function() {
      assert.throws(function() {
        this.group.active();
      }.bind(this));
    });

    it('should return false with new feature', function(done) {
      this.group.active('foobar').then(function(enabled) {
        assert.equal(enabled, false);
        done();
      });
    });

  });

});