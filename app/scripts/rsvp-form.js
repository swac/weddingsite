'use strict';

var React = require( 'react' );

var RadioGroup = require( 'react-radio-group' );
var fetch = require( 'whatwg-fetch' );

class RsvpSearch extends React.Component {
  constructor( props ) {
    super(props)
    this.state = {
      attending: null,
      foundGroup: null,
      searched: false
    };
  }

  handleAttendingChange( event ) {
    let val = this.refs.attendingGroup.getCheckedValue() === "yes" ? true : false;

    this.setState( { attending: val });
  }

  handleSubmitForm( e ) {
    e.preventDefault();

    let data = {
      group: this.state.foundGroup,
      attending: this.state.attending,
      diet: React.findDOMNode( this.refs.diet ).value.trim(),
      comments: React.findDOMNode( this.refs.comments ).value.trim()
    }

    console.log( data );
  }

  render() {
    let showError;
    if ( !this.state.foundGroup && this.state.searched ) {
      showError = <div>Could not find group! Please search again or contact us at anaandnick@gmail.com</div>;
    }

    let rsvpInfo;
    if ( this.state.foundGroup ) {
      var members = this.state.foundGroup.map( function( member ) {
        return <div key={member.first+member.last}>{member.first} {member.last}</div>;
      });

      var group = <div><h4>Party Members</h4>{ members }</div>;

      var attending = (
        <div>
          <label>
            Dietary Preference:
            <input type="text" ref="diet" placeholder="vegan, vegetarian, etc." />
          </label>
          
          <br />
          <label>
            Other Comments:
            <input type="text" ref="comments" />
          </label>

          <br />
          <input type="submit" value="Submit" />
        </div>
      );

      var notAttending = (
        <div>
          <p>:( We are sorry you cannot make it.</p>
          <label>
            Care to tell us why?
            <input type="text" ref="comments" />
          </label>

          <br />
          <input type="submit" value="Submit" />
        </div>
      );

      var attendingOrNot;
      if ( this.state.attending !== null ) {
        attendingOrNot = this.state.attending ? attending : notAttending;
      }

      rsvpInfo = (
        <form onSubmit={this.handleSubmitForm.bind( this )}>
          { group }
          <RadioGroup ref="attendingGroup" name="attending" value={this.state.attending} onChange={this.handleAttendingChange.bind(this)}>
            
            <h3>Will you be Attending?</h3>
            <label>
              <input value="yes" type="radio" />Yes
            </label>

            <label>
              <input value="no" type="radio" />No
            </label>

            <br />
            { attendingOrNot }

          </RadioGroup>
        </form>
      );
    }

    return (
      <div>
        <form onSubmit={this.handleSearch.bind( this )}>
          <label>
            First Name:
            <input type="text" ref="firstName" />
          </label>
          <label>
            Last Name:
            <input type="text" ref="lastName" />
          </label>
          <input type="submit" value="Search" />
        </form>

        { showError ? showError : '' }
        { rsvpInfo ? rsvpInfo : '' }
      </div>
    );
  }

  handleSearch( e ) {
    e.preventDefault();

    let firstName = React.findDOMNode( this.refs.firstName ).value.trim();
    let lastName = React.findDOMNode( this.refs.lastName ).value.trim();

    if ( !firstName || !lastName ) {
      return;
    }

    this.rsvpSearch( firstName, lastName )
      .then( ( resp ) => resp.json() )
      .then( ( members ) => {
        this.setState({ foundGroup: members, searched: true });
      })
      .catch( () => {
        this.setState({ searched: true });
      });
  }

  rsvpSearch( firstName, lastName ) {
    return self.fetch(`/api/guests?first=${firstName}&last=${lastName}`);
  }
}

module.exports = RsvpSearch;