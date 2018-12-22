import React, { Component } from 'react';

class TextField extends Component {
    render() {
      var text = this.props.title
      return (
  
        <span className="Portfolio-Title">{text}</span>
  
      )
    }
  }

export default TextField;