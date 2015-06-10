'use strict';

var React = require( 'react' );

var RadioGroup = require( 'react-radio-group' );

class RsvpSearch extends React.Component {
  constructor( props ) {
    super(props)
    this.state = {
      attending: null,
      foundGroup: null,
      searched: false
    };
  }

  render() {
    let showError;
    if ( !this.state.foundGroup && this.state.searched ) {
      showError = <div>Could not find group! Please search again or contact us at anaandnick@gmail.com</div>;
    }

    return (
      <div>
        <form onSubmit={this.handleSubmit.bind( this )}>
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

        <form>
          <RadioGroup name="attending" value={this.state.attending}>
            <span>Will you be Attending?</span>

            <label>
              <input value="yes" type="radio" />Yes
            </label>

            <label>
              <input value="no" type="radio" />No
            </label>
          </RadioGroup>
        </form>
      </div>
    );
  }

  handleSubmit( e ) {
    e.preventDefault();

    let firstName = React.findDOMNode( this.refs.firstName ).value.trim();
    let lastName = React.findDOMNode( this.refs.lastName ).value.trim();

    if ( !firstName || !lastName ) {
      return;
    }

    this.handleRsvpSearch( firstName, lastName )
      .done( ( resp ) => {
        this.setState({ foundGroup: resp, searched: true });
      })
      .error( () => {
        this.setState({ searched: true });
      });
  }

  handleRsvpSearch( firstName, lastName ) {
    return $.get(`/api/guests?first=${firstName}&last=${lastName}`);
  }
}

module.exports = RsvpSearch;