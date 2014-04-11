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

Rollout is a Redis-backed feature rollout. This allows you to, dynamically, control each feature within your Node application. Because it's backed by Redis, it allows you to manually control each feature, resulting in an effort-less mechanism to shutdown malfunctioning features, or rolling out a new feature to users.

```js
var Rollout = require('rollout');
```

This exports the `Rollout` constructor. There's an alias function called `.create` to instantiate a new Rollout.

```js
var Rollout = require('rollout');
Rollout.create(); // New instance.
```

You may pass a custom Redis client instance to both the constructor `new Rollout(redis)` or the `.create` method `Rollout.create(redis)`.


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
