import React, { Component } from 'react';
import './App.css';
import Portfolio from './components/Portfolio'
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    // this.API_KEY = "PH3K5QD8FR375RC3";
    // this.API_KEY = "UFUKA50N6XJ3YQQB";
    this.API_KEY = "5V5OEOEN5K98E697";
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

  savePortfolio(id, portfolioState) {
    var portfolios = this.state.portfolios;
    // console.log("Saving Portfolio:" + JSON.stringify(portfolioState));
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

  componentDidMount() {
    // const state = JSON.parse(window.localStorage.getItem("saved_state"));
    // console.log(window.localStorage.getItem("saved_state"));
    // if (state) {
    //   this.setState(state);
    // }
    // else{
    //   this.setState({
    //     portfolioCount: 0,
    //     portfolios: [
    //       <Portfolio //TODO remove
    //       key={-1}
    //       id={"init"}
    //       onClick={(id) => this.handleClicks(id)}
    //     />
    //     ],
    //     nextId: 0,
    //   });
    // }
  }

  componentDidUpdate() {
    const state = this.state;
    console.log("Saved State:" + JSON.stringify(state));
    window.localStorage.setItem("saved_state", JSON.stringify(state));
  }

  // setAndSaveState(state){
  // this.setState(state);
  // window.localStorage.setItem("saved_state", JSON.stringify(this.state));
  // }

  removePortfolio(id) {
    var newPortfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    // console.log("Handling Clicks id:" + id + " newPortfolios length:" + newPortfolios.length);
    var removed = false;
    for (var i = 0; i < newPortfolios.length; i++) {
      // console.log(newPortfolios[i].id + ":" + id);
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

  addPortfolio() {
    // this.setErrorText("");
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
      // console.log("Added Portfolio");
    }
    this.updateExchangeRate();
  }

  /* Not updating more than once due to limited API calls*/
  updateExchangeRate() {
    if (this.state.EXCHANGE_RATE_USD_TO_EUR === 0) {
      if (!this.state.triedInitExchangeRateLoad) {
        this.setState({ triedInitExchangeRateLoad: true })
      }
      // this.setAndSaveState({ EXCHANGE_RATE_USD_TO_EUR: 0.5 });
      const url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=" + this.props.API_KEY;
      axios.get(url).then(res => {
        // console.log(JSON.stringify(res));
        var response = res.data['Realtime Currency Exchange Rate'];
        if (response == null) {
          this.setErrorText("Error getting exchange rate data from API, probably overused API-key. Add new Portfolio or stock to retry.");
        } else {
          var exchangeRate = response['5. Exchange Rate'];
          // console.log('Exchange rate: ' + exchangeRate);
          this.setState({ EXCHANGE_RATE_USD_TO_EUR: exchangeRate });
          this.setErrorText("");
        }
      })
        .catch(error => { console.log(error); this.setErrorText("Error during updating exchange rate: " + error) });
    }


    // {"data":{"Realtime Currency Exchange Rate":{"1. From_Currency Code":"USD","2. From_Currency Name":"United States Dollar","3. To_Currency Code":"EUR","4. To_Currency Name":"Euro","5. Exchange Rate":"0.87910000","6. Last Refreshed":"2018-12-22 23:47:38","7. Time Zone":"UTC"}},"status":200,"statusText":"OK","headers":{"content-type":"application/json"},"config":{"transformRequest":{},"transformResponse":{},"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1,"headers":{"Accept":"application/json, text/plain, */*"},"method":"get","url":"https://www.alphavanta
  }
  setErrorText(errorText) {
    this.setState({ errorText: errorText })
  }

  setInfoText(infoText) {
    this.setState({ infoText: infoText })
  }

  render() {
    if (!this.state.triedInitExchangeRateLoad) {
      this.updateExchangeRate();
    }
    // const portfolios = this.state.portfolios;
    const portfolioCount = this.state.portfolioCount;
    var addPortfolioButton = <button id="addPortfolioButton" onClick={() => this.addPortfolio()}>Add Portfolio</button>
    if (portfolioCount > 9) {
      addPortfolioButton = <button className="Disabled-Button" id="addPortfolioButton" disabled>Add Portfolio</button>
    }
    const portfoliosState = this.state.portfolios;
    console.log("StocksSaved:" + JSON.stringify(portfoliosState));
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
