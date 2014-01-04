freeze-flip
===========

Freeze is a pretty simple, yet powerful feature flipper, powered by Redis.

## Usage

```js
var Freeze = require('freeze-flip');
var freeze = new Freeze({ host: '127.0.0.1', port: 6379 });

freeze.enable('feature_name').then(...);
freeze.disable('feature_name').then(...);

feature.isEnabled('feature_name')
  .then(function(enabled) 
  {
    if (enabled) {
      // Feature is enabled.
    } else {
      // Do something else.
    }
  });
```

## License

MIT