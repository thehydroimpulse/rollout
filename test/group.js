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
      this.group.active('foobarff').then(function(enabled) {
        assert.equal(enabled, false);
        done();
      });
    });

    it('should return true with existing feature', function(done) {
      var name = this.rollout.name('rollout:groups:' + this.group.name);
      this.rollout.client.sadd(name, 'foobar11', function(err) {
        this.group.active('foobar11').then(function(enabled) {
          assert.equal(enabled, true);
          done();
        });
      }.bind(this));
    });

  });

  describe('.activate()', function() {

    beforeEach(function() {
      this.rollout = Rollout.create();
      this.group   = Group.create('foo', this.rollout);
    });

    it('should define fn', function() {
      assert.equal('function', typeof this.group.activate);
    });

    it('should throw an error without a feature name', function() {
      assert.throws(function() {
        this.group.activate();
      }.bind(this));
    });

    it('should return a promise', function() {
      assert(this.group.activate('foo') instanceof Promise);
    });

    it('should activate a feature', function(done) {
      this.group.activate('fivefooo123').then(function() {
        this.group.active('fivefooo123').then(function(active) {
          assert.equal(active, true);
          done();
        });
      }.bind(this));
    });

  });

});