import React, { Component } from 'react';

class TextInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.title
        }
    }
    handleInput(evt) {
        evt.preventDefault();
        const newTitle = this.state.inputValue;
        this.props.handleTitle(newTitle);

    }
    updateInputValue(evt) {
        evt.preventDefault();
        this.setState({
            inputValue: evt.target.value
        });
    }


    // handleAddStockSubmit(evt) {
    //     this.resetErrorText();
    //     evt.preventDefault()
    //     const name = evt.target.name.value;
    //     const quantity = evt.target.quantity.value;
    //     this.addStock(name, quantity);
    // }

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