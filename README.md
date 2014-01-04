freeze-flip
===========

Freeze is a pretty simple, yet powerful feature flipper, powered by Redis.

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