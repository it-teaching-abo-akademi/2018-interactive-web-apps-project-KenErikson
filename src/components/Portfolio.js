import React, { Component } from 'react';
import TextInput from './TextInput';
import TextField from './TextField';
import Stock from './Stock';
import axios from 'axios';

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
                stocks: []
            }
        }
    }

    /** Save updated state in 'this.state' and in local webstorage */
    setAndSaveState(state) {
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
    }

    /** Get Exchange Rate */
    getExchangeRate() {
        return this.props.EXCHANGE_RATE_USD_TO_EUR;
    }

    /** Get isShowingEuros boolean */
    isShowingEruos() {
        return !!this.state.showingEuro;
    }

    /** Toggle edit Title mode */
    toggleEditing() {
        this.resetErrorText();
        var userIsEditing = !this.state.userIsEditing;
        this.setAndSaveState({
            userIsEditing: userIsEditing,
        });
    }

    /** Toggle add stock mode */
    toggleAddingStock() {
        this.resetErrorText();
        var userIsAddingStock = !this.state.userIsAddingStock;
        this.setAndSaveState({
            userIsAddingStock: userIsAddingStock,
        });
    }

    /** Update Title */
    updateTitle(newTitle) {
        this.resetErrorText();
        this.setAndSaveState({
            title: newTitle,
            userIsEditing: false,
        })
    }

    /** Fetch stock data from API */
    fetchStockData(terms) {
        const stockUrl = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=" + terms + "&apikey=" + this.props.API_KEY;
        console.log(stockUrl);
        return axios.get(stockUrl)
    }

    /** Add Stock */
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
                if (exists) {
                    this.setStock(stockIndex, addQuantityInt, -1);
                    this.getPending = false;
                } else {
                    if (newStocks.length < 50) {
                        const pricesPromise = this.fetchStockData(name);
                        pricesPromise.then(res => {
                            var stocks = res.data['Stock Quotes'];
                            if (stocks == null) {
                                this.setErrorText("Error getting data for '" + name + "' from API, probably overused API-key");
                            } else {
                                var prices = [];
                                for (var i = 0; i < stocks.length; i++) {
                                    const stock = stocks[0];
                                    const name = stock["1. symbol"];
                                    const price = stock["2. price"];
                                    prices.push({ name: name, price: price });
                                }
                                if (prices.length === 1) {
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
                                                price: prices[0].price,
                                                selected: false,
                                                index: newStocks.length,
                                            }
                                        );
                                        this.setAndSaveState({
                                            stocks: newStocks
                                        });
                                        this.updateStockPrices();
                                    } else {
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
                            .catch(error => { console.log(error); this.setErrorText("Error during updating stocks: " + error); this.getPending=false;});

                    } else {
                        this.setErrorText("Can't add more unique stock names.");
                    }
                }
            } else {
                this.setErrorText("Adding stock too fast, take a deep breath.");
            }
        } else {
            if(name ===''){
                this.setErrorText("Can't add stock with empty name");
            }else{
                this.setErrorText("Can't add stock with quantity<1");
            }
        }
    }

    /** Check Validity of 'Stock Quantity'-field */
    handleChangeStockQuantity(evt) {
        const addStockQuantity = (evt.target.validity.valid) ? evt.target.value : this.state.addStockQuantity;
        this.setAndSaveState({
            addStockQuantity: addStockQuantity
        })
    }

    /** Check Validity of 'Stock Name'-field */
    handleChangeStockName(evt) {
        const addStockName = (evt.target.validity.valid) ? evt.target.value : this.state.addStockName;
        this.setAndSaveState({
            addStockName: addStockName
        })
    }

    /** Add Stock and Override normal Submit action */
    handleAddStockSubmit(evt) {
        this.resetErrorText();
        evt.preventDefault()
        const name = evt.target.name.value;
        const quantity = evt.target.quantity.value;
        this.addStock(name, quantity);
    }

    /** Get <div> containing 'Add Stock'-fields */
    getAddStockFields() {
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

    /** Reset Error Text */
    resetErrorText() {
        this.setAndSaveState({ errorText: "", });
    }

    /** Set Error Text */
    setErrorText(errortext) {
        this.setAndSaveState({ errorText: errortext });
    }

    /** Update All Stock Prices */
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
            const pricesPromise = this.fetchStockData(terms);
            pricesPromise.then(res => {
                var stocks = res.data['Stock Quotes'];
                if (stocks == null) {
                    this.setErrorText("Error updating all stocks from API, probably overused API-key");
                } else {
                    for (var i = 0; i < stocks.length; i++) {
                        const stock = stocks[i];
                        const name = stock["1. symbol"];
                        const price = stock["2. price"];
                        this.setUnitValue(name, price);
                    }
                }
            })
                .catch(error => { console.log(error); this.setErrorText("Error during updating stocks: " + error) });
        }
    }

    /** Toggle Showing Euros */
    toggleShowingEuro() {
        var showingEuro = !this.state.showingEuro;
        this.setAndSaveState({ showingEuro: showingEuro });

        const stocks = this.state.stocks;
        for (var i = 0; i < stocks.length; i++) {
            this.setStock(i, 0, -1);
        }
    }

    /** Set Value of one Stock */
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

    /* Set Stock data by index, price=-1 to keep old price */
    setStock(stockIndex, addQuantity, price) {

        var addQuantityInt = parseInt(addQuantity);
        var newStocks = this.state.stocks;
        var existingStock = newStocks[stockIndex];
        const name = existingStock.name;
        const oldQuantity = parseInt(existingStock.quantity);
        const oldPrice = existingStock.price;
        if (price === -1) {
            price = oldPrice;
        }
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
    }

    /** Calculate Total Value */
    calculateTotalValue() {
        const stocks = this.state.stocks;
        var totalValue = 0;
        for (var i = 0; i < stocks.length; i++) {
            totalValue += parseFloat(stocks[i].price * stocks[i].quantity);
        }
        if (this.state.showingEuro) {
            totalValue = totalValue * this.props.EXCHANGE_RATE_USD_TO_EUR;
        }
        return parseInt(totalValue * 100) / 100.0;
    }

    /** Toggle 'Selected'-state of Stock by name */
    toggleSelectedStock(name) {
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
            const newStock = stocks[stockIndex];
            newStock['selected'] = !newStock['selected'];
            stocks.splice(stockIndex, 1, newStock);
            this.setAndSaveState({ stocks });
        } else {
            this.setErrorText("Found no stock with name:" + name);
        }
    }

    /** Remove all 'Selected' stocks */
    removeSelected() {
        var newStocks = this.state.stocks;
        for (var i = newStocks.length - 1; i >= 0; i--) {
            const stockToRemove = newStocks[i];
            if (stockToRemove.selected) {
                newStocks.splice(i, 1);
            }
        }
        this.setAndSaveState({ stocks: newStocks });
    }

    /** Render Portfolio */
    render() {
        const userIsEditing = this.state.userIsEditing;
        const userIsAddingStock = this.state.userIsAddingStock;
        var titleField;
        var toggleText;
        const errorText = this.state.errorText;
        const savedStocks = this.state.stocks;
        const showingEuro = this.state.showingEuro;
        
        /** Disable 'Remove Selected' if no stocks selected */
        var selectedExists = false;
        for(var i=0;i<savedStocks.length;i++){
            if(savedStocks[i].selected){
                selectedExists = true;
                break;
            }
        }
        var removeSelectedButton;
        if(selectedExists){
            removeSelectedButton = <button onClick={() => this.removeSelected()}>Remove selected</button>
        }else{
            removeSelectedButton = <button className="Disabled-Button" disabled>Remove selected</button>
        }

        /** Parse Stocks from state */
        var stocks = [];
        for (i = 0; i < savedStocks.length; i++) {
            const name = savedStocks[i].name;
            const price = savedStocks[i].price;
            const quantity = savedStocks[i].quantity;
            const selected = savedStocks[i].selected;
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

        /** Make Title editable if in 'userIsEditing'-state */
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

        /** Add 'Add Stock'-fields if in 'userIsAddingStock'-state */
        var addStockButton = <button onClick={() => this.toggleAddingStock()}>Add Stocks</button>;
        var addStockFields;
        if (userIsAddingStock) {
            addStockFields = this.getAddStockFields();
            addStockButton = <button className="Disabled-Button" disabled>Add Stocks</button>;
        }

        /** Show Correct Currency */
        var currentlyShowingCurrency = "$";
        var notShowingCurrency = "€";
        if (showingEuro) {
            currentlyShowingCurrency = "€";
            notShowingCurrency = "$";
        }

        /** Calculate Total Value */
        const totalValue = this.calculateTotalValue();

        /** Make Table width look correct with and without scrollbar */
        var formHeaderWrapper = "Portfolio-Board-Header-Wrapper";
        if(stocks.length>4){
            formHeaderWrapper+=" Portfolio-Board-Scrollbar"
        }

        // Separate tbodies from headers due to react not reading {stocks} correctly otherwise
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
                <div className={formHeaderWrapper}>
                    <table className="Portfolio-Board">
                        <tbody>
                            <tr>
                                <th className="large-col">Name</th>
                                <th className="large-col">Unit value</th>
                                <th className="small-col">Quantity</th>
                                <th className="large-col">Total value</th>
                                <th className="small-col">Select</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                    <div className="Portfolio-Board-Wrapper">
                        <table className="Portfolio-Board">
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
                    {removeSelectedButton}                    
                </div>
            </div>
        );
    }
}


export default Portfolio;