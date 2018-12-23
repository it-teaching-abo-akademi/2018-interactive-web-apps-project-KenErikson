import React, { Component } from 'react';
import './App.css';
import Portfolio from './components/Portfolio'
import axios from 'axios';

class App extends Component {
  /* Init state */
  constructor(props) {
    super(props);

    this.API_KEY = "PH3K5QD8FR375RC3";
    // this.API_KEY = "UFUKA50N6XJ3YQQB";
    // this.API_KEY = "5V5OEOEN5K98E697";
    const localStorageState = JSON.parse(window.localStorage.getItem("saved_state"));
    console.log("Loaded State: " + window.localStorage.getItem("saved_state"));
    if (localStorageState) {
      this.state = localStorageState;
    } else {
      this.state = {
        EXCHANGE_RATE_USD_TO_EUR: 0,
        triedInitExchangeRateLoad: false,
        errorText: "",
        infoText: "",
        portfolioCount: 0,
        portfolios: [],
        nextId: 0,
      };
    }
  }

  /* Save Portfolio in state */
  savePortfolio(id, portfolioState) {
    var portfolios = this.state.portfolios;
    for (var i = 0; i < portfolios.length; i++) {
      if (portfolios[i].id === id) {
        const newPortfolio = {
          id: id,
          state: portfolioState,
        };
        portfolios.splice(i, 1, newPortfolio);
      }
    }
    this.setState({ portfolios: portfolios });
    this.updateExchangeRate();
    this.setInfoText("");
    this.setErrorText("");
  }

  /* Save state to Local storage when any component updates */
  componentDidUpdate() {
    const state = this.state;
    window.localStorage.setItem("saved_state", JSON.stringify(state));
  }

  /** Remove Portfolio by id*/
  removePortfolio(id) {
    var newPortfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    var removed = false;
    for (var i = 0; i < newPortfolios.length; i++) {
      if (newPortfolios[i].id === id) {
        newPortfolios.splice(i, 1);
        removed = true;
        newPortfolioCount--;
        break;
      }
    }

    if (!removed) {
      console.log("Nothing Removed");
    }

    this.setState(
      {
        portfolioCount: newPortfolioCount,
        portfolios: newPortfolios,
        nextId: nextId
      }
    );
  }

  /** Add new Portfolio if <10 */
  addPortfolio() {
    const portfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    if (portfolioCount < 10) {
      newPortfolios.push(
        { id: nextId }
      );
      this.setInfoText("Added Portfolio (" + newPortfolios.length + ")")
      this.setState({
        portfolioCount: portfolioCount + 1,
        portfolios: newPortfolios,
        nextId: nextId + 1,
      }
      );
    }
    this.updateExchangeRate();
  }

  /* Not updating more than once due to limited API calls*/
  updateExchangeRate() {
    if (this.state.EXCHANGE_RATE_USD_TO_EUR === 0) {
      if (!this.state.triedInitExchangeRateLoad) {
        this.setState({ triedInitExchangeRateLoad: true })
      }
      const url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=" + this.props.API_KEY;
      axios.get(url).then(res => {
        var response = res.data['Realtime Currency Exchange Rate'];
        if (response == null) {
          this.setErrorText("Error getting exchange rate data from API, probably overused API-key. Wait ~10 seconds and add new Portfolio or stock to retry.");
        } else {
          var exchangeRate = response['5. Exchange Rate'];
          this.setState({ EXCHANGE_RATE_USD_TO_EUR: exchangeRate });
          this.setErrorText("");
        }
      })
        .catch(error => { console.log(error); this.setErrorText("Error during updating exchange rate: " + error) });
    }
  }

  /** Set error text */
  setErrorText(errorText) {
    this.setState({ errorText: errorText })
  }

  /** Set info text */
  setInfoText(infoText) {
    this.setState({ infoText: infoText })
  }

  /** Render App */
  render() {
    if (!this.state.triedInitExchangeRateLoad) {
      this.updateExchangeRate();
    }
    const portfolioCount = this.state.portfolioCount;
    var addPortfolioButton = <button id="addPortfolioButton" onClick={() => this.addPortfolio()}>Add Portfolio</button>
    if (portfolioCount > 9) {
      addPortfolioButton = <button className="Disabled-Button" id="addPortfolioButton" disabled>Add Portfolio</button>
    }
    
    /** Parse Portfolios from state */
    const portfoliosState = this.state.portfolios;
    const portfolios = [];
    for (var i = 0; i < portfoliosState.length; i++) {
      const id = portfoliosState[i].id;
      const savedPortfolioState = portfoliosState[i].state;
      portfolios.push(
        <Portfolio
          key={id}
          id={id}
          API_KEY={this.API_KEY}
          EXCHANGE_RATE_USD_TO_EUR={this.state.EXCHANGE_RATE_USD_TO_EUR}
          state={savedPortfolioState}
          onClick={() => this.removePortfolio(id)}
          savePortfolio={(state) => this.savePortfolio(id, state)}
        />
      );
    }
    const errorText = this.state.errorText;
    const infoText = this.state.infoText;
    return (
      <div className="App">
        {addPortfolioButton}
        <div className="row Info-Row">
          <p className="Error-Text">{errorText}</p>
          <p className="Info-Text">{infoText}</p>
        </div>
        <div className="App-Portfolios">
          {portfolios}
        </div>
      </div>
    );
  }
}

export default App;
