import React, { Component } from 'react';

/** Generic TextInput */
class TextInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.title
        }
    }

    /** Handle Input, disabling default submit action */
    handleInput(evt) {
        evt.preventDefault();
        const newTitle = this.state.inputValue;
        this.props.handleTitle(newTitle);

    }

    /** Update Input Value */
    updateInputValue(evt) {
        evt.preventDefault();
        this.setState({
            inputValue: evt.target.value
        });
    }

    /** Render Text Input Form */
    render() {
        var text = this.state.inputValue;
        return (
            <form className="Add-Stock-Form" ref="form" onSubmit={(evt) => this.handleInput(evt)}>
                <input
                    className="Portfolio-Title"
                    type="text"
                    value={text}
                    onChange={evt => this.updateInputValue(evt)}
                ></input>
                <button type="submit">Save</button>
            </form>
        )
    }
}

export default TextInput;