var parse = require( 'csv-parse' );
var transform = require( 'stream-transform' );

var fs = require( 'fs' );

process.stdout.write( '[\n' );

var parser = parse();

var transformer = transform( function( record ) {
  var first = {
    "first": record[ 0 ],
    "last": record[ 1 ]
  };

  var others = record[ 2 ].split( /\n/ ).filter( function( elem ) {
    return elem !== '';
  }).map( function( elem ) {
    var name = elem.split( ' ' );

    var firstName = name[ 0 ];
    var lastName = name[ 1 ] ? name[ 1 ] : '';

    return {
      first: firstName,
      last: lastName
    };
  });

  console.log( JSON.stringify({ members: [ first ].concat( others ) }) + ',');
  return;
});

var stream = fs.createReadStream( './sheet.csv' );

stream.pipe(parser).pipe(transformer).pipe(process.stdout);