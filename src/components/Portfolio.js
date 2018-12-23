import React, { Component } from 'react';
import TextInput from './TextInput';
import TextField from './TextField';
import axios from 'axios';

class Stock extends Component {
    constructor(props) {
        super(props);
        this.DECIMALS = 3;
        this.state = {
            selected: false,
        }
    }

    render() {
        const DIVIDER = 10 ** this.DECIMALS;
        const showingEuros = this.props.isShowingEruos();
        var exchangeRate = 1;
        if (showingEuros) {
            exchangeRate = this.props.getExchangeRate();
        }
        console.log("exRate: " + exchangeRate + " €:" + showingEuros);
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{parseInt(this.props.price * exchangeRate * DIVIDER) / DIVIDER}</td>
                <td>{this.props.quantity}</td>
                <td>{parseInt(this.props.price * exchangeRate * this.props.quantity * (DIVIDER)) / (DIVIDER)}</td>
                <td>No</td>
            </tr>
        );
    }
}


//https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=MSFT&apikey=PH3K5QD8FR375RC3
class Portfolio extends Component {
    constructor(props) {
        super(props);
        // this.API_KEY = "PH3K5QD8FR375RC3";
        // this.API_KEY = "UFUKA50N6XJ3YQQB";
        this.API_KEY = "5V5OEOEN5K98E697";
        this.state = {
            userIsEditing: false,
            userIsAddingStock: true,//TODO set false
            EXCHANGE_RATE_USD_TO_EUR: 1, //TODO change
            triedInitExchangeRateLoad: false, //Want try it once on first reload 
            showingEuro: false,
            errorText: "",
            addStockQuantity: 1,//TODO rename
            addStockName: "MSFT",//TODO rename
            title: ("Portfolio " + props.id),
            stocks: [<Stock
                key="NOK"
                name="NOK"
                price={0}
                quantity={3}
                getExchangeRate={() => this.getExchangeRate()}
                isShowingEruos={() => this.isShowingEruos()}
            />] //TODO remove
        }
    }

    setAndSaveState(state) {
        this.setState(state);
        // console.log("state:" +JSON.stringify(this.state));
        this.props.savePortfolio(this.state);
        // window.localStorage.setItem("saved_state_portfolio_" + this.props.id, JSON.stringify(this.state));
    }

    getExchangeRate() {
        console.log("getting ExchangeRate: " + this.state.EXCHANGE_RATE_USD_TO_EUR);
        return this.state.EXCHANGE_RATE_USD_TO_EUR;
    }

    isShowingEruos() {
        console.log("Get is showing €: " + !!this.state.showingEuro);
        return !!this.state.showingEuro;
    }

    toggleEditing() {
        this.resetErrorText();
        var userIsEditing = !this.state.userIsEditing;
        this.setState({
            userIsEditing: userIsEditing,
        });
    }

    toggleAddingStock() {
        this.resetErrorText();
        var userIsAddingStock = !this.state.userIsAddingStock;
        this.setState({
            userIsAddingStock: userIsAddingStock,
        });
    }

    updateTitle(newTitle) {
        this.resetErrorText();
        this.setState({
            title: newTitle,
            userIsEditing: false,
        })
    }

    fetchStockData(terms) {
        const stockUrl = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=" + terms + "&apikey=" + this.API_KEY;
        console.log(stockUrl);
        return axios.get(stockUrl)
    }

    addStock(name, addQuantity) {
        var addQuantityInt = parseInt(addQuantity);
        if (name !== '' && addQuantityInt > 0 && !this.state.getPending) {
            var newStocks = this.state.stocks;
            var exists = false;
            var stockIndex = -1;
            for (var i = 0; i < newStocks.length; i++) {
                if (newStocks[i].props.name === name) {
                    exists = true;
                    stockIndex = i;
                    break;
                }
            }
            console.log("Exists:" + exists + " index:" + stockIndex)
            if (exists) {
                this.setStock(stockIndex, addQuantityInt, -1);
                // var existingStock = newStocks[stockIndex];
                // const oldQuantity = parseInt(existingStock.props.quantity);
                // console.log("Stock:" + JSON.stringify(existingStock));
                // var newStock = (<Stock
                //     key={name}
                //     name={name}
                //     quantity={oldQuantity + addQuantityInt}
                // />)
                // newStocks.splice(stockIndex, 1, newStock);
                // this.setState({
                //     stocks: newStocks
                // });
                console.log("Changed current stock '" + name + "'");
            } else {
                if (newStocks.length < 50) {
                    const pricesPromise = this.fetchStockData(name);
                    pricesPromise.then(res => {
                        console.log(res.data);
                        var stocks = res.data['Stock Quotes'];
                        if (stocks == null) {
                            this.setErrorText("Error getting data from API, probably overused API-key");
                        } else {

                            console.log(stocks);
                            var prices = [];
                            for (var i = 0; i < stocks.length; i++) {
                                const stock = stocks[0];
                                const name = stock["1. symbol"];
                                const price = stock["2. price"];
                                console.log(name + ":" + price);
                                prices.push({ name: name, price: price });
                            }
                            if (prices.length === 1) {
                                console.log("length 1");
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
                                        <Stock
                                            key={name}
                                            name={name}
                                            quantity={addQuantityInt}
                                            price={0}
                                            getExchangeRate={() => this.getExchangeRate()}
                                            isShowingEruos={() => this.isShowingEruos()}
                                        />
                                    );
                                    this.setState({
                                        stocks: newStocks
                                    });
                                    console.log("Added stock '" + name + "'");
                                    this.updateStockPrices();
                                    // this.updateExchangeRate();
                                } else {
                                    //TODO duplicated code
                                    for (i = 0; i < newStocks.length; i++) {
                                        if (newStocks[i].props.name === name) {
                                            exists = true;
                                            stockIndex = i;
                                            break;
                                        }
                                    }
                                    if (exists) {
                                        this.setStock(stockIndex, addQuantityInt, -1)
                                        // var existingStock = newStocks[stockIndex];
                                        // const oldQuantity = parseInt(existingStock.props.quantity);
                                        // console.log("Stock:" + JSON.stringify(existingStock));
                                        // var newStock = (<Stock
                                        //     key={name}
                                        //     name={name}
                                        //     quantity={oldQuantity + addQuantityInt}
                                        //     />)
                                        //     newStocks.splice(stockIndex, 1, newStock);
                                        //     this.setState({
                                        //         stocks: newStocks
                                        //     });
                                        //     console.log("Changed current stock '" + name + "'");
                                        // }else{
                                        //     this.setErrorText("Stock '"+name+"' doesn't exist, but has a key in the memory.");
                                    }


                                }
                            } else {
                                this.setErrorText("Can't find stock for symbol '" + name + "'");
                            }
                        }
                    })
                        .catch(error => console.log(error));

                } else {
                    this.setErrorText("Can't add more unique stock names.");
                }
            }
        } else {
            this.setState({ errorText: "UNALLOWED Name:" + name + " Quantity:" + addQuantity });
            console.log("UNALLOWED Name:" + name + " Quantity:" + addQuantity);
        }
    }

    handleChangeStockQuantity(evt) { //TODO better naming of everything
        this.resetErrorText();
        console.log("newValue: " + evt.target.value + " valid:" + evt.target.validity.valid);
        const addStockQuantity = (evt.target.validity.valid) ? evt.target.value : this.state.addStockQuantity;
        this.setState({
            addStockQuantity: addStockQuantity
        })
    }

    handleChangeStockName(evt) { //TODO better naming of everything
        this.resetErrorText();
        console.log("name: " + evt.target.value + " valid:" + evt.target.validity.valid);
        const addStockName = (evt.target.validity.valid) ? evt.target.value : this.state.addStockName;
        this.setState({
            addStockName: addStockName
        })
    }

    handleAddStockSubmit(evt) {
        this.resetErrorText();
        evt.preventDefault()
        console.log(evt.target.name.value + ":" + evt.target.quantity.value);
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
        this.setState({ errorText: "", });
    }

    setErrorText(errortext) {
        this.setState({ errorText: errortext });
    }

    updateStockPrices() {
        const stocks = this.state.stocks;
        var terms = "";
        for (var i = 0; i < stocks.length; i++) {
            if (i > 0) {
                terms += ",";
            }
            terms += stocks[i].props.name;
        }
        if (terms !== "") {
            console.log("terms: " + terms);
            const pricesPromise = this.fetchStockData(terms);
            pricesPromise.then(res => {
                var stocks = res.data['Stock Quotes'];
                if (stocks == null) {
                    this.setErrorText("Error getting data from API, probably overused API-key");
                } else {

                    console.log(stocks);
                    // var prices = [];
                    for (var i = 0; i < stocks.length; i++) {
                        const stock = stocks[i];
                        const name = stock["1. symbol"];
                        const price = stock["2. price"];
                        console.log(name + ":" + price);
                        this.setUnitValue(name, price);
                    }
                }
            });
        }
    }

    toggleShowingEuro() {
        var showingEuro = !this.state.showingEuro;
        this.setState({ showingEuro: showingEuro });

        /* Force update, TODO move*/
        const stocks = this.state.stocks;
        for (var i = 0; i < stocks.length; i++) {
            this.setStock(i, 0, -1);
        }
        console.log("Showing euro: " + showingEuro + " rate: " + this.state.EXCHANGE_RATE_USD_TO_EUR);
    }

    setUnitValue(name, price) {
        var newStocks = this.state.stocks;
        var found = false;
        for (var i = 0; i < newStocks.length; i++) {
            if (newStocks[i].props.name === name) {
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
        console.log(JSON.stringify(existingStock));
        const name = existingStock.props.name;
        const oldQuantity = parseInt(existingStock.props.quantity);
        const oldPrice = existingStock.props.price;
        if (price === -1) {
            price = oldPrice;
        }
        // console.log("Stock:" + JSON.stringify(existingStock));
        console.log(name + " is changed to quantity:" + (oldQuantity + addQuantityInt) + " and price:" + price)
        var newStock = (<Stock
            key={name}
            name={name}
            quantity={oldQuantity + addQuantityInt}
            price={price}
            getExchangeRate={() => this.getExchangeRate()}
            isShowingEruos={() => this.isShowingEruos()}
        />)
        newStocks.splice(stockIndex, 1, newStock);
        this.setState({
            stocks: newStocks
        });
        console.log("Changed current stock '" + name + "'");

    }

    /* Not updating more than once due to limited API calls*/
    updateExchangeRate() {
        //TODO move to app...
        if (this.state.EXCHANGE_RATE_USD_TO_EUR === 1) {
            this.setAndSaveState({ EXCHANGE_RATE_USD_TO_EUR: 0.5 });
            // const url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=" + this.API_KEY;
            // axios.get(url).then(res => {
            //     console.log(JSON.stringify(res));
            //     var response = res.data['Realtime Currency Exchange Rate'];
            //     if (response == null) {
            //         this.setState({triedInitExchangeRateLoad:true});
            //         this.setErrorText("Error getting data from API, probably overused API-key");
            //     } else {

            //         var exchangeRate = response['5. Exchange Rate'];
            //         console.log('Exchange rate: ' + exchangeRate);
            //         this.setState({ EXCHANGE_RATE_USD_TO_EUR: exchangeRate,
            //         triedInitExchangeRateLoad: true});
            //     }
            // });

        }
        // {"data":{"Realtime Currency Exchange Rate":{"1. From_Currency Code":"USD","2. From_Currency Name":"United States Dollar","3. To_Currency Code":"EUR","4. To_Currency Name":"Euro","5. Exchange Rate":"0.87910000","6. Last Refreshed":"2018-12-22 23:47:38","7. Time Zone":"UTC"}},"status":200,"statusText":"OK","headers":{"content-type":"application/json"},"config":{"transformRequest":{},"transformResponse":{},"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1,"headers":{"Accept":"application/json, text/plain, */*"},"method":"get","url":"https://www.alphavanta
    }

    calculateTotalValue() {
        const stocks = this.state.stocks;
        var totalValue = 0;
        for (var i = 0; i < stocks.length; i++) {
            totalValue += parseFloat(stocks[i].props.price * stocks[i].props.quantity);
        }
        if (this.state.showingEuro) {
            totalValue = totalValue * this.state.EXCHANGE_RATE_USD_TO_EUR;
        }
        return parseInt(totalValue * 1000) / 1000.0;
    }

    render() {
        if (!this.state.triedInitExchangeRateLoad) {
            this.updateExchangeRate();
        }
        const userIsEditing = this.state.userIsEditing;
        const userIsAddingStock = this.state.userIsAddingStock;
        var titleField;
        var toggleText;
        const stocks = this.state.stocks;
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
                    <span id="error_text">{errorText}</span>
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
                <div className="row">Total value: {totalValue}{currentlyShowingCurrency}</div>
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