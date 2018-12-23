import React, { Component } from 'react';
import TextInput from './TextInput';
import TextField from './TextField';
import axios from 'axios';

class Stock extends Component {
    constructor(props) {
        super(props);
        this.DECIMALS = 3;
    }

    toggleSelected() {
        this.props.toggleSelectedStock(this.props.name);
    }

    render() {
        const DIVIDER = 10 ** this.DECIMALS;
        const showingEuros = this.props.isShowingEruos();
        var exchangeRate = 1;
        if (showingEuros) {
            exchangeRate = this.props.getExchangeRate();
        }
         return (
            <tr>
                <td>{this.props.name}</td>
                <td>{parseInt(this.props.price * exchangeRate * DIVIDER) / DIVIDER}</td>
                <td>{this.props.quantity}</td>
                <td>{parseInt(this.props.price * exchangeRate * this.props.quantity * (DIVIDER)) / (DIVIDER)}</td>
                <td><input type="checkbox" name="selected" value="selected" onChange={() => this.toggleSelected()} checked={this.props.selected} /></td>
            </tr>
        );
    }
}


//https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=MSFT&apikey=PH3K5QD8FR375RC3
class Portfolio extends Component {
    constructor(props) {
        super(props);
        const savedState = props.state;
        if (savedState != null) {
            this.state = savedState;
        } else {
            this.state = {
                userIsEditing: false,
                userIsAddingStock: false,
                showingEuro: false,
                errorText: "",
                addStockQuantity: 1,
                addStockName: "",
                title: ("Portfolio " + props.id),
                stocks: [
                    //     {
                    //     name: "NOK",
                    //     price: 0,
                    //     quantity: 3,
                    //     selected:false,
                    // }
                ] //TODO remove
            }
        }
    }

    setAndSaveState(state) {
        // console.log("old state:" + JSON.stringify(this.state));

        var newState = this.state;
        for (var oldAttr in newState) {
            for (var newAttr in state) {
                if (oldAttr === newAttr) {
                    newState[newAttr] = state[newAttr];
                }
            }
        }

        this.setState(newState);
        this.props.savePortfolio(newState);
        // console.log("new state:" + JSON.stringify(newState));
    }

    getExchangeRate() {
        // console.log("getting ExchangeRate: " + this.props.EXCHANGE_RATE_USD_TO_EUR);
        return this.props.EXCHANGE_RATE_USD_TO_EUR;
    }

    isShowingEruos() {
        // console.log("Get is showing €: " + !!this.state.showingEuro);
        return !!this.state.showingEuro;
    }

    toggleEditing() {
        this.resetErrorText();
        var userIsEditing = !this.state.userIsEditing;
        this.setAndSaveState({
            userIsEditing: userIsEditing,
        });
    }

    toggleAddingStock() {
        this.resetErrorText();
        var userIsAddingStock = !this.state.userIsAddingStock;
        this.setAndSaveState({
            userIsAddingStock: userIsAddingStock,
        });
    }

    updateTitle(newTitle) {
        this.resetErrorText();
        this.setAndSaveState({
            title: newTitle,
            userIsEditing: false,
        })
    }

    fetchStockData(terms) {
        const stockUrl = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=" + terms + "&apikey=" + this.props.API_KEY;
        console.log(stockUrl);
        return axios.get(stockUrl)
    }

    addStock(name, addQuantity) {
        var addQuantityInt = parseInt(addQuantity);
        if (name !== '' && addQuantityInt > 0) {
            if (!this.getPending) {
                this.getPending = true;
                var newStocks = this.state.stocks;
                var exists = false;
                var stockIndex = -1;
                for (var i = 0; i < newStocks.length; i++) {
                    if (newStocks[i].name === name) {
                        exists = true;
                        stockIndex = i;
                        break;
                    }
                }
                // console.log("Exists:" + exists + " index:" + stockIndex)
                if (exists) {
                    this.setStock(stockIndex, addQuantityInt, -1);
                    // console.log("Changed current stock '" + name + "'");
                    this.getPending = false;
                } else {
                    if (newStocks.length < 50) {
                        const pricesPromise = this.fetchStockData(name);
                        pricesPromise.then(res => {
                            // console.log(res.data);
                            var stocks = res.data['Stock Quotes'];
                            if (stocks == null) {
                                this.setErrorText("Error getting data from API, probably overused API-key");
                            } else {
                                // console.log(stocks);
                                var prices = [];
                                for (var i = 0; i < stocks.length; i++) {
                                    const stock = stocks[0];
                                    const name = stock["1. symbol"];
                                    const price = stock["2. price"];
                                    // console.log(name + ":" + price);
                                    prices.push({ name: name, price: price });
                                }
                                if (prices.length === 1) {
                                    // console.log("length 1");
                                    var exists = false;
                                    var stockIndex = -1;
                                    for (i = 0; i < newStocks.length; i++) {
                                        if (newStocks[i].key === name) {
                                            exists = true;
                                            stockIndex = i;
                                            break;
                                        }
                                    }
                                    if (!exists) {
                                        newStocks.push(
                                            {
                                                name: name,
                                                quantity: addQuantityInt,
                                                price: 0,
                                                selected: false,
                                                index: newStocks.length,
                                            }
                                        );
                                        this.setAndSaveState({
                                            stocks: newStocks
                                        });
                                        // console.log("Added stock '" + name + "'");
                                        this.updateStockPrices();
                                    } else {
                                        //TODO duplicated code
                                        for (i = 0; i < newStocks.length; i++) {
                                            if (newStocks[i].name === name) {
                                                exists = true;
                                                stockIndex = i;
                                                break;
                                            }
                                        }
                                        if (exists) {
                                            this.setStock(stockIndex, addQuantityInt, -1)
                                        }
                                    }
                                } else {
                                    this.setErrorText("Can't find stock for symbol '" + name + "'");
                                }
                            }
                            this.getPending = false;
                        })
                            .catch(error => { console.log(error); this.setErrorText("Error during updating stocks: " + error) });

                    } else {
                        this.setErrorText("Can't add more unique stock names.");
                    }
                }
            } else {
                this.setErrorText("Adding stock too fast, take a deep breath.");
            }
        } else {
            this.setErrorText("Unallowed state: (emptyName:" + (name === '') + ", quantity<1:" + (addQuantity < 1) + ")");
        }
    }

    handleChangeStockQuantity(evt) { //TODO better naming of everything
        this.resetErrorText();
        // console.log("newValue: " + evt.target.value + " valid:" + evt.target.validity.valid);
        const addStockQuantity = (evt.target.validity.valid) ? evt.target.value : this.state.addStockQuantity;
        this.setAndSaveState({
            addStockQuantity: addStockQuantity
        })
    }

    handleChangeStockName(evt) { //TODO better naming of everything
        this.resetErrorText();
        // console.log("name: " + evt.target.value + " valid:" + evt.target.validity.valid);
        const addStockName = (evt.target.validity.valid) ? evt.target.value : this.state.addStockName;
        this.setAndSaveState({
            addStockName: addStockName
        })
    }

    handleAddStockSubmit(evt) {
        this.resetErrorText();
        evt.preventDefault()
        // console.log(evt.target.name.value + ":" + evt.target.quantity.value);
        const name = evt.target.name.value;
        const quantity = evt.target.quantity.value;
        this.addStock(name, quantity);
    }

    getAddStockFields() {
        //TODO remove AA
        return (
            <div className="row">
                <form className="Add-Stock-Form" ref="form" onSubmit={(evt) => this.handleAddStockSubmit(evt)}>
                    <label htmlFor="name">Stock Name:</label>
                    <input id="name" value={this.state.addStockName} type="text" pattern="[A-Z-.]{0,5}" onChange={evt => this.handleChangeStockName(evt)} />
                    <label htmlFor="quantity">Quantity:</label>
                    <input id="quantity" type="number" step="1" min="1" max="1000000" onChange={evt => this.handleChangeStockQuantity(evt)} value={this.state.addStockQuantity} />
                    <button type="submit">Add stock</button>
                </form>
                <button onClick={() => this.toggleAddingStock()}>Cancel</button>
            </div>
        );
    }

    resetErrorText() {
        this.setAndSaveState({ errorText: "", });
    }

    setErrorText(errortext) {
        this.setAndSaveState({ errorText: errortext });
    }

    updateStockPrices() {
        const stocks = this.state.stocks;
        var terms = "";
        for (var i = 0; i < stocks.length; i++) {
            if (i > 0) {
                terms += ",";
            }
            terms += stocks[i].name;
        }
        if (terms !== "") {
            // console.log("terms: " + terms);
            const pricesPromise = this.fetchStockData(terms);
            pricesPromise.then(res => {
                var stocks = res.data['Stock Quotes'];
                if (stocks == null) {
                    this.setErrorText("Error getting data from API, probably overused API-key");
                } else {
                    // console.log(stocks);
                    for (var i = 0; i < stocks.length; i++) {
                        const stock = stocks[i];
                        const name = stock["1. symbol"];
                        const price = stock["2. price"];
                        // console.log(name + ":" + price);
                        this.setUnitValue(name, price);
                    }
                }
            })
                .catch(error => { console.log(error); this.setErrorText("Error during updating stocks: " + error) });
        }
    }

    toggleShowingEuro() {
        var showingEuro = !this.state.showingEuro;
        this.setAndSaveState({ showingEuro: showingEuro });

        /* Force update, TODO move*/
        const stocks = this.state.stocks;
        for (var i = 0; i < stocks.length; i++) {
            this.setStock(i, 0, -1);
        }
        // console.log("Showing euro: " + showingEuro + " rate: " + this.props.EXCHANGE_RATE_USD_TO_EUR);
    }

    setUnitValue(name, price) {
        var newStocks = this.state.stocks;
        var found = false;
        for (var i = 0; i < newStocks.length; i++) {
            if (newStocks[i].name === name) {
                this.setStock(i, 0, price);
                found = true;
                break;
            }
        }
        if (!found) {
            this.setErrorText("Couldn't find '" + name + "' when updating prices.");
        }
    }

    /* -1 to keep old price */
    setStock(stockIndex, addQuantity, price) {

        var addQuantityInt = parseInt(addQuantity);
        var newStocks = this.state.stocks;
        var existingStock = newStocks[stockIndex];
        // console.log(JSON.stringify(existingStock));
        const name = existingStock.name;
        const oldQuantity = parseInt(existingStock.quantity);
        const oldPrice = existingStock.price;
        if (price === -1) {
            price = oldPrice;
        }
        // console.log("Stock:" + JSON.stringify(existingStock));
        // console.log(name + " is changed to quantity:" + (oldQuantity + addQuantityInt) + " and price:" + price)
        var newStock = ({
            name: name,
            quantity: oldQuantity + addQuantityInt,
            price: price,
            selected: false,
            index: stockIndex,
        }
        );
        newStocks.splice(stockIndex, 1, newStock);
        this.setAndSaveState({
            stocks: newStocks
        });
        // console.log("Changed current stock '" + name + "'");

    }

    calculateTotalValue() {
        const stocks = this.state.stocks;
        var totalValue = 0;
        for (var i = 0; i < stocks.length; i++) {
            totalValue += parseFloat(stocks[i].price * stocks[i].quantity);
        }
        if (this.state.showingEuro) {
            totalValue = totalValue * this.props.EXCHANGE_RATE_USD_TO_EUR;
        }
        return parseInt(totalValue * 1000) / 1000.0;
    }

    toggleSelectedStock(name) {
        // const stocks = 
        var stockIndex = -1;
        var found = false;
        var stocks = this.state.stocks;
        for (var i = 0; i < stocks.length; i++) {
            var newStock = stocks[i];
            if (newStock.name === name) {
                found = true;
                stockIndex = i;
                break;
            }
        }
        if (found) {
            // console.log("Index:"+i);
            console.log("index:" + stockIndex + " " + JSON.stringify(stocks[stockIndex]))
            const newStock = stocks[stockIndex];
            newStock['selected'] = !newStock['selected'];
            stocks.splice(stockIndex, 1, newStock);
            this.setAndSaveState({ stocks });
        } else {
            this.setErrorText("Found no stock with name:" + name);
        }
        // const index = i - 1;
        // console.log("stocks:" + JSON.stringify(stocks))
    }

    removeSelected() {
        var newStocks = this.state.stocks;
        for (var i = newStocks.length - 1; i >= 0; i--) {
            const stockToRemove = newStocks[i];
            // console.log("i:"+i+" Stock:"+JSON.stringify(stockToRemove));
            if (stockToRemove.selected) {
                newStocks.splice(i, 1);
            }
        }
        this.setAndSaveState({ stocks: newStocks });
    }

    render() {
        const userIsEditing = this.state.userIsEditing;
        const userIsAddingStock = this.state.userIsAddingStock;
        var titleField;
        var toggleText;

        const savedStocks = this.state.stocks;
        var stocks = [];
        for (var i = 0; i < savedStocks.length; i++) {
            const name = savedStocks[i].name;
            const price = savedStocks[i].price;
            const quantity = savedStocks[i].quantity;
            const selected = savedStocks[i].selected;
            // console.log("Adding stock: " + name + " i:" + i);
            stocks.push(
                <Stock
                    key={name}
                    name={name}
                    price={price}
                    quantity={quantity}
                    selected={selected}
                    index={i}
                    getExchangeRate={() => this.getExchangeRate()}
                    isShowingEruos={() => this.isShowingEruos()}
                    toggleSelectedStock={(name) => this.toggleSelectedStock(name)}
                />
            );
        }
        const errorText = this.state.errorText;
        const showingEuro = this.state.showingEuro;
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

        var addStockButton = <button onClick={() => this.toggleAddingStock()}>Add Stocks</button>;
        var addStockFields;
        if (userIsAddingStock) {
            addStockFields = this.getAddStockFields();
            addStockButton = <button className="Disabled-Button" disabled>Add Stocks</button>;
        }

        var currentlyShowingCurrency = "$";
        var notShowingCurrency = "€";
        if (showingEuro) {
            currentlyShowingCurrency = "€";
            notShowingCurrency = "$";
        }

        const totalValue = this.calculateTotalValue();

        // Separate tbodies for headers due to react not reading {stocks} correctly otherwise
        return (
            <div className="App-Portfolio">
                <div className="row">
                    {titleField}
                    <button onClick={() => this.toggleEditing()}>{toggleText}</button>
                    <button className="Exit-Button" onClick={() => this.props.onClick(this.props.id)}>X</button>
                </div>

                <div className="row">
                    <span className="bold">Showing </span><span className="bold large">{currentlyShowingCurrency}</span>
                    <button onClick={() => this.toggleShowingEuro()}>Show in {notShowingCurrency}</button>
                    <span className="Error-Text">{errorText}</span>
                </div>

                <div className="row">
                    <div className="Portfolio-Board-Wrapper">
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
                </div>
                <div className="row">Total value: {totalValue}{currentlyShowingCurrency}</div>
                {addStockFields}
                <div className="row">
                    {addStockButton}
                    <button onClick={() => this.removeSelected()}>Remove selected</button>
                </div>
            </div>
        );
    }
}


export default Portfolio;