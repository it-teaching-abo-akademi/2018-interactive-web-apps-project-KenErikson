import React, { Component } from 'react';
import './App.css';
import Portfolio from './components/Portfolio'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      portfolioCount: 0,
      portfolios: [],
      nextId: 0,
    }
  }

  handleClicks(id) {
    //TODO add id back to 'pool?'
    var newPortfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    console.log("Handling Clicks id:" + id + " newPortfolios length:" + newPortfolios.length);
    var removed = false;
    for (var i = 0; i < newPortfolios.length; i++) {
      console.log(newPortfolios[i].props.id + ":" + id);
      if (newPortfolios[i].props.id === id) {
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
    const portfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    if (portfolioCount < 10) {

      newPortfolios.push(<Portfolio
        key={nextId}
        id={nextId}
        onClick={(id) => this.handleClicks(id)}
      />);
      this.setState({
        portfolioCount: portfolioCount + 1,
        portfolios: newPortfolios,
        nextId: nextId + 1,
      }
      );
      console.log("Added Portfolio");
    }
  }

  render() {
    const portfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    const portfolioCount = this.state.portfolioCount;
    return (
      <div className="App">
        <header className="App-header">
          <button id="addPortfolioButton" onClick={() => this.addPortfolio()}>Add Portfolio nr:{portfolioCount} id:{nextId}</button>
          <div className="App-Portfolios">
            {portfolios}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
