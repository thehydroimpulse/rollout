var Rollout = require('..');
var assert  = require('assert');
var Promise = require('bluebird');
var User    = Rollout.User;

describe('users', function() {

  it('should export a function', function() {
    assert.equal('function', typeof User);
  });

  it('should return a new User instance', function() {
    assert(User.create({}, 1) instanceof User);
  });

  it('should add the user to the set', function(done) {
    var rollout = Rollout.create();
    User.create({id: 55}, rollout);

    setTimeout(function() {
      var name = rollout.name('rollout:users');
      rollout.client.sismember(name, 55, function(err, result) {
        result === 1
          ? done()
          : done(false);
      });
    }, 10);
  });

  it('should throw without a params', function() {
    assert.throws(function() {
      User.create();
    }, Error);

    assert.throws(function() {
      User.create('foo');
    }, Error);
  });

  describe('.active', function() {

    beforeEach(function() {
      this.rollout = Rollout.create();
      this.user   = User.create('foo', this.rollout);
    });

    it('should define fn', function() {
      assert.equal('function', typeof this.user.active);
    });

    it('should throw an error without a feature name', function() {
      assert.throws(function() {
        this.user.active();
      }.bind(this));
    });

    it('should return false with new feature', function(done) {
      this.user.active('hhhh').then(function(enabled) {
        assert.equal(enabled, false);
        done();
      });
    });

  });

  describe('.activate()', function() {

    beforeEach(function() {
      this.rollout = Rollout.create();
      this.user   = User.create('foo', this.rollout);
    });

    it('should define fn', function() {
      assert.equal('function', typeof this.user.activate);
    });

    it('should throw an error without a feature name', function() {
      assert.throws(function() {
        this.user.activate();
      }.bind(this));
    });

    it('should return a promise', function() {
      assert(this.user.activate('foo') instanceof Promise);
    });

    it('should activate a feature', function(done) {
      this.user.activate('fivefooo123').then(function() {
        this.user.active('fivefooo123').then(function(active) {
          assert.equal(active, true);
          done();
        });
      }.bind(this));
    });

  });

});