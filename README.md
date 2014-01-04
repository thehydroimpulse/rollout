freeze-flip
===========

Freeze is a pretty simple, yet powerful feature flipper, powered by Redis.

![](https://i.cloudup.com/VWPQ9PulP6.png)

## Usage

```js
var Freeze = require('freeze-flip');
var freeze = new Freeze({ host: '127.0.0.1', port: 6379 });

freeze.enable('feature_name').then(...);
freeze.disable('feature_name').then(...);

feature.isEnabled('feature_name').then(function(enabled) 
{
  if (enabled) {
    // Feature is enabled.
  } else {
    // Do something else.
  }
});
```

## Defining Features

Because Redis is not persistent, and for this usecase, should not.
We need a way to easily define these features and re-allocate them. This allows you to re-define the features whenever your application launches, or whenever you deploy. It only creates entries that do not currently exist. By default, newly defined features will be disabled.

```js
freeze.define('feature_name');
```

## Express App

This module comes with an express app to help you manage the features. It comes with the ability to list all the features, and their status (enabled, disabled), and allows you to flip it.

```js
var Freeze = require('freeze-flip');

// Create a new server;
Freeze.createApp(freezeInstance)
  .listen(4000);
```

The `createApp` method returns an express application.

## License

MIT