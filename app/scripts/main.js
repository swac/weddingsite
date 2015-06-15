var React = require( 'react' );
var RsvpForm = require( './rsvp-form.js' );

React.render( <RsvpForm />, document.getElementById( 'rsvp-form' ) );

$('.nav a').on('click', function(){
    $(".navbar-toggle").click() //bootstrap 3.x by Richard
});