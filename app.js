var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var url = require( 'url' );

var app = express();

var guestList = require( './parties.json' );
var _ = require( 'lodash' );

var Promise = require( 'bluebird' );

// view engine setup

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

app.get( '/api/guests', function( req, res, next ) {
  var query = url.parse( req.url, true ).query;

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
    res.status(404).send();
  }
});

var Spreadsheet = require( 'edit-google-spreadsheet' );
var auth = require( './auth.json' );

var loadSpreadsheet = Promise.promisify( Spreadsheet.load, Spreadsheet );

var fs = Promise.promisifyAll( require( 'fs' ) );

function submitRsvp( data ) {
  var party = data.group.map( function( elem ) {
    return elem.first + ' ' + elem.last;
  });



  return loadSpreadsheet({
    debug: true,
    spreadsheetId: '1HQH_vr6jG39NmOwhS1At-6Xwewachu3Xjf9EnGoD3ao',
    worksheetId: 'od6',

    oauth2: auth.oauth2
  })
  .then( function sheetReady( spreadsheet ) {
    var receive = Promise.promisify( spreadsheet.receive, spreadsheet );
    return Promise.join( spreadsheet, receive() );
  })
  .spread( function( spreadsheet, receiveResp) {
    var plaintextParty = [ party.join(';'), data.attending, data.diet, data.comments ].join(',') + '\n';
    return Promise.join( spreadsheet, receiveResp, fs.appendFile( 'responses.txt', plaintextParty ) );
  })
  .spread( function( spreadsheet, receiveResp ) {
    var info = receiveResp[ 1 ];

    var obj = {};
    obj[ info.lastRow + 1 ] = {
      1: party.join( ', ' ),
      2: data.attending,
      3: data.diet,
      4: data.comments
    };

    spreadsheet.add( obj );
    var send = Promise.promisify( spreadsheet.send, spreadsheet );
    return send({ autoSize: true });
  });
}

app.post( '/api/rsvp', function( req, res ) {
  submitRsvp( req.body )
  .then( function() { 
    res.sendStatus( 200 );
  })
  .catch( function( e ) {
    console.log( e );
    res.sendStatus( 500 );
  });
});


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
    res.send( err.message );
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send( err.message );
});


module.exports = app;
