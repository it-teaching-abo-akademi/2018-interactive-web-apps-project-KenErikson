import React, { Component } from 'react';

/** Generic TextField */
class TextField extends Component {
    render() {
      var text = this.props.title;
      return (
        <span className="Portfolio-Title">{text}</span>
      )
    }
  }

export default TextField;