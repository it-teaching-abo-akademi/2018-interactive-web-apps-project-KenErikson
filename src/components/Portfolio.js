import React, { Component } from 'react';
import TextInput from './TextInput';
import TextField from './TextField';

class Stock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            unitVal: props.unitVal,
            quantity: props.quantity,
            selected: false,
        }
    }

    render() {

        return (
            <tr>
                <td>{this.state.name}</td>
                <td>{this.state.unitVal}</td>
                <td>{this.state.quantity}</td>
                <td>{this.state.unitVal * this.state.quantity}</td>
                <td>k</td>
            </tr>
        );
    }
}



class Portfolio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userIsEditing: false,
            userIsAddingStock: true,//TODO set false
            financialGoal:1,//TODO rename
            title: "Portfolio " + props.id,
            stocks: [<Stock
                key="NOK"
                name="NOK"
                unitVal={2}
                quantity={3}
            />] //TODO remove
        }
    }
    toggleEditing() {
        var userIsEditing = !this.state.userIsEditing;
        this.setState({
            userIsEditing: userIsEditing,
        });
    }

    toggleAddingStock() {
        var userIsAddingStock = !this.state.userIsAddingStock;
        this.setState({
            userIsAddingStock: userIsAddingStock,
        });
    }

    updateTitle(newTitle) {
        this.setState({
            title: newTitle,
            userIsEditing: false
        })
    }

    addStock() {
        var newStocks = this.state.stocks;
        newStocks.push(
            <Stock
                key="name2"
                name="test"
                unitVal={2}
                quantity={3}
            />
        );
        this.setState({
            stocks: newStocks
        });
        console.log("Added stock " + newStocks.length);
    }

    handleChange(evt){
        console.log("newValue: "+evt.target.value + " valid:"+evt.target.validity.valid);
        const financialGoal = (evt.target.validity.valid) ? evt.target.value : this.state.financialGoal;
        this.setState({
            financialGoal:financialGoal
        })
    }

    // onChange(e){
    //     const re = /^[0-9\b]+$/;
    
    //     // if value is not blank, then test the regex
    
    //     if (e.target.value === '' || re.test(e.target.value)) {
    //        this.setState({financialGoal: e.target})
    //     }
    // }

    getAddStockFields(){
        return (
            <div className="row">
                <label htmlFor="name">Stock Name:</label>
                <input id="name" defaultValue="" />
                <label htmlFor="quantity">Quantity:</label>
                {/* <input id="quantity" type="text" pattern="[1-9][0-9]" onChange={evt => this.handleChange(evt)} value={this.state.financialGoal} /> */}
                <input id="quantity" type="number" step="1" min="1" max="1000000" onChange={evt => this.handleChange(evt)} value={this.state.financialGoal} />
                <button >Add stock</button>
                <button >Cancel</button>
            </div>
        );
    }

    render() {
        const userIsEditing = this.state.userIsEditing;
        const userIsAddingStock = this.state.userIsAddingStock;
        var titleField;
        var toggleText;
        const stocks = this.state.stocks;

        if (userIsEditing) {
            toggleText = "Cancel";
            titleField = <TextInput className="Portfolio-Title"
                title={this.state.title}
                handleTitle={(title) => this.updateTitle(title)}
            />
        } else {
            toggleText = "Edit";
            titleField = <TextField className="Portfolio-Title"
                title={this.state.title} />
        }

        var addStockButton = <button  onClick={() => this.toggleAddingStock()}>Add Stocks</button>;
        var addStockFields;
        if (userIsAddingStock) {
            addStockFields = this.getAddStockFields();
            addStockButton = <button className="Disabled-Button" disabled>Add Stocks</button>;
        }

        // Separate tbodies for headers due to react not reading {stocks} correctly otherwise
        return (
            <div className="App-Portfolio">
                <div className="row">
                    {titleField}
                    <button  onClick={() => this.toggleEditing()}>{toggleText}</button>
                    <button className="Exit-Button" onClick={() => this.props.onClick(this.props.id)}>X</button>
                </div>

                <div className="row">
                    <button >Show in €</button>
                    <button >Show in $</button>
                </div>

                <div className="row">
                    <table id="Portfolio-Board">
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <th>Unit value</th>
                                <th>Quantity</th>
                                <th>Total value</th>
                                <th>Select</th>
                            </tr>
                        </tbody>
                        <tbody>
                            {stocks}
                        </tbody>
                    </table>
                </div>
                <div className="row">Total value row</div>
                {addStockFields}
                <div className="row">
                    {addStockButton}
                    <button >Perf graph</button>
                    <button >Remove selected</button>
                </div>
            </div>
        );
    }
}


export default Portfolio;