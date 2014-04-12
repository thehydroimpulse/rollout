[![Build Status](https://travis-ci.org/TheHydroImpulse/rollout.svg?branch=master)](https://travis-ci.org/TheHydroImpulse/rollout) [![NPM version](https://badge.fury.io/js/rollout.svg)](http://badge.fury.io/js/rollout) [![Release alpha](http://img.shields.io/badge/release-alpha-red.svg)](https://github.com/TheHydroImpulse/rollout) [![Coverage Status](https://coveralls.io/repos/TheHydroImpulse/rollout/badge.png?branch=master)](https://coveralls.io/r/TheHydroImpulse/rollout?branch=master)


# Rollout

Inspired by the [Ruby library Rollout](https://github.com/FetLife/rollout).


## Install

You can grab Rollout through Npm:

```
npm install rollout
```

Simply require it:

```js
var Rollout = require('rollout');
```

## Getting Started

Rollout is a Redis-backed feature rollout. This allows you to, dynamically, control each feature within your Node application. Because it's backed by Redis, it still allows you to scale as you please.

```js
var Rollout = require('rollout');
```

This exports the `Rollout` constructor. There's an alias function called `.create` to instantiate a new Rollout.

```js
var Rollout = require('rollout');
Rollout.create(); // New instance.
```

You may pass a custom Redis client instance to both the constructor `new Rollout(redis)` or the `.create` method `Rollout.create(redis)`.

If you don't pass a Redis client, Rollout will create one itself, defaulting to a local Redis server.

### Active?

(Note: Further examples with `rollout` are `Rollout` instances.)

You can check if a feature is activated. Groups are explained below, however, a simple `.active` call will check the `all` group, which applies to *all* users.

```js
rollout.active('featureName').then(function(active) {
  // ...
  active; // true/false
});
```

As you can see, Rollout works exclusively with promises.

## Groups

Groups allow you, to, well, group users by specific critierias. These criterias are simply functions applied to a given user object that you can create.

Rollout comes with a built-in `all` group, which applies to all users.

```js
rollout.group('all', function(user) {
  return true;
});
```

The user object passed is completely agnostic. The only requirement is to specify a unique ID, which is defaulted to `id`.

```js
rollout.id('_id');
```

You can check if a group has a feature activated:

```js
rollout.group('all').active('feature123').then(function(active) {
  // ...
});
```

And you can activate a feature:

```js
rollout.group('all').activate('feature123').then(function() {
  // ...
});
```

## User

Feature rollouts can also be user oriented. Thus, you can enable features on a per-user basis. If the user belongs to a group, whenever you check if a feature is enabled on the user, we'll also check the group(s).

```js
rollout.user({ id: 5 });
```

Let's activate a feature for the user.

```js
rollout.user({ id: 5 }).activate('purchase').then(function() {
  // ...
});
```

And verify:

```js
rollout.user({ id: 5}).active('purchase').then(function(active) {
  // ...
});
```

---

## Advanced

Let's define a new `admin` group.

```js
rollout.group('admin', function(user) {
  return !!user.isAdmin;
});
```

Now we can enable features for that group:

```js
rollout.group('admin').activate('user:delete').then(function() {
  // ...
});
```

Now we can check a user if they have access to this feature:

```js
rollout.user({ id: 10, isAdmin: false }).active('user:delete').then(function(active) {
  active === false; // true
});
```

## License

The MIT License (MIT)

Copyright (c) 2014 Daniel Fagnan <dnfagnan@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
