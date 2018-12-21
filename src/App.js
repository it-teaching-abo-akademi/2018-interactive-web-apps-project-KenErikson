import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  render() {
    return (
      <div className="App-Portfolio">
        <span className="Portfolio-Title">Potrfolio {this.props.id}</span>
        <button className="Portfolio-Button">Show in €</button>
        <button className="Portfolio-Button">Show in $</button>
        <button className="Portfolio-Button Exit" onClick={this.props.onClick()}>X</button>
      </div>
    );
  }
}

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
    const portfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    console.log("HELLO");
    for (var i = 0; i < newPortfolios.length; i++) {
      if (newPortfolios[i].id === id) {
        newPortfolios.splice(i, 1);
        break;
      }
    }

    this.setState(
      {
        portfolioCount: portfolioCount,
        portfolios: newPortfolios,
        nextId: nextId
      }
    );
    // add to 'ToBeRemoved'

    // var newPortfolios = this.state.portfolios;
    // const portfolioCount = this.state.portfolioCount;
    // newPortfolios = newPortfolios.splice(newPortfolios.indexOf(1), 1);
    // this.setState(
    //   {
    //     portfolioCount: portfolioCount - 1,
    //     portfolios: newPortfolios
    //   }
    // );
  }

  addPortfolio() {
    const portfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    newPortfolios.push(<Portfolio
      id={nextId}
      onClick={ ()=> this.handleClicks()}
    />);
    this.setState({
      portfolioCount: portfolioCount + 1,
      portfolios: newPortfolios,
      nextId: nextId + 1,
    }
    );
    console.log("Added");
    // const newPortfolios = this.state.portfolios;
    // if (this.state.portfolioCount< 10) {
    // newPortfolios.push(<Portfolio
    //   id={nextId}
    //   onClick={() => this.handleClick(nextId)}
    // />);
    // this.setState({ 
    //   portfolioCount:  portfolioCount + 1,
    //   portfolios: newPortfolios 
    // });
    // this.portfolioCount = portfolioCount + 1;
    // this.portfolios = newPortfolios;
    // this.nextId++;
    // }
  }

  render() {
    const portfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    return (
      <div className="App">
        <header className="App-header">
          <button id="addPortfolioButton" onClick={() => this.addPortfolio()}>Add Portfolio {nextId}</button>
          <div className="App-Portfolios">
            {portfolios}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
