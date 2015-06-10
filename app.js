var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var url = require( 'url' );

var app = express();

var guestList = require( './parties.json' );
var _ = require( 'lodash' );

// view engine setup

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use( '/api/guests', function( req, res, next ) {
  var query = url.parse( req.url, true ).query;
  console.log( query );

  var first = query.first.toLowerCase();
  var last = query.last.toLowerCase();

  var party = _.find( guestList, function( party ) {
    return _.find( party.members, function( member ) {
      return first === member.first.toLowerCase() &&
        last === member.last.toLowerCase();
    });
  });

  if ( party ) {
    res.status(200).send( party.members );
  } else {
    res.status(404).end();
  }
  next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
