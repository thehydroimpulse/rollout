/**
 * Module dependencies.
 */

var express = require('express');
var app     = express();
var hbs     = require('express-hbs');
var flash   = require('express-flash');
var freeze  = null;

/**
 * Setup
 */

app.use(express.errorHandler());
app.use(express.compress());
app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());

app.use(express.cookieParser('1848fj39u293fj'));
app.use(express.session('hellek0udd9u3293(@U@'));

app.engine('html', hbs.express3({
  partialsDir: __dirname + '/views',
  layoutsDir: __dirname + '/views',
  extname: '.html'
}));

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.configure('production', function()
{
  app.set('view cache', true);
});

app.use(flash());

/**
 * Module exports.
 */

exports = module.exports = function(instance)
{
  freeze = instance;
  return app;
};

/**
 * Main route.
 */

app.get('/', function(req, res)
{

  freeze.list()
    .then(function(obj)
    {
      var features = [];
      for(var key in obj) {
        features.push({
          name: key,
          status: obj[key]
        });
      }

      res.render('index', {
        features: features
      });
    });
});

/**
 * Flip
 */

app.get('/flip/:feature', function(req, res)
{
  var feature = req.params.feature;

  // Flip it.

  freeze.flip(feature)
    .then(function(result)
    {
      req.flash('success', 'The ' + feature + ' feature was successfully ' + result + '.');
      res.redirect('/');
    });
});