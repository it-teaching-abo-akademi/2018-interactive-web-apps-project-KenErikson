import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

class Portfolio extends Component{
  render() {
    return(
    <p>Hello</p>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      portfolioCount:0
    }
  }

  addPortfolio(){
    if(this.state.portfolioCount<10){
      this.setState({portfolioCount:this.state.portfolioCount+1});
    }
  }

  render() {
    const portfolios = [];
    portfolios.push(<Portfolio />);
    for(let i = 0; i < this.state.portfolioCount; i++) {
      portfolios.push(<Portfolio />);
    }

    return (
      <div className="App">
        <header className="App-header">
          <button onClick={()=>this.addPortfolio()}>Add Portfolio {this.state.portfolioCount}</button>
          SPMS
          <p>Lol</p>
          {portfolios}
        </header>
      </div>
    );
  }
}

export default App;
