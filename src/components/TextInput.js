import React, { Component } from 'react';

class TextInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.title
        }
    }
    handleInput() {
        const newTitle = this.state.inputValue;
        this.props.handleTitle(newTitle);

    }
    updateInputValue(evt) {
        this.setState({
            inputValue: evt.target.value
        });
    }
    render() {
        var text = this.state.inputValue;
        return (
            <div className="form-group">
                <input
                    type="text"
                    value={text}
                    onChange={evt => this.updateInputValue(evt)}
                ></input>
                <button  onClick={() => this.handleInput()}>Save</button>
            </div>
        )
    }
}

export default TextInput;