import React, { Component } from 'react';
import './App.css';
import Portfolio from './components/Portfolio'


class App extends Component {
  constructor(props) {
    super(props);
    const localStorageState = JSON.parse(window.localStorage.getItem("saved_state"));
    console.log(window.localStorage.getItem("saved_state"));
    if (localStorageState) {
      //{"portfolioCount":2,"portfolios":[{"key":"-1","ref":null,"props":{"id":"init"},"_owner":null,"_store":{}},{"key":"0","ref":null,"props":{"id":0},"_owner":null,"_store":{}},{"key":"1","ref":null,"props":{"id":1},"_owner":null,"_store":{}}],"nextId":2}
      // const portfolioCount = localStorageState.portfolioCount;
      // const portfolios = [];
      // for(var i =0;i<localStorageState.portfolios.length;i++){
      //   portfolios.push(
      //     <Portfolio //TODO remove
      //     key={localStorageState.portfolios.key}
      //     id={localStorageState.portfolios[i].props.id}
      //     onClick={(id) => this.handleClicks(id)}
      //     />
      //     )
      //   }
      //   const nextId = localStorageState.nextId;
      // this.state = {
      //   portfolioCount:portfolioCount,
      //   portfolios:portfolios,
      //   nextId: nextId,
      // };
    }else{
      this.state = {
        portfolioCount: 0,
        portfolios: [
          <Portfolio //TODO remove
          key={-1}
          id={"init"}
          onClick={(id) => this.handleClicks(id)}
          />
        ],
        nextId: 0,
      };
    }
  }

  savePortfolio(portfolioState){

  }

  componentDidMount(){
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
    console.log("saved state:" + JSON.stringify(state));
    window.localStorage.setItem("saved_state", JSON.stringify(state));
  }

  handleClicks(id) {
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
    // const portfolios = this.state.portfolios;
    const nextId = this.state.nextId;
    const portfolioCount = this.state.portfolioCount;
    const portfolios = [];
    for(var i =0;i<localStorageState.portfolios.length;i++){
      portfolios.push(
        <Portfolio //TODO remove
        key={localStorageState.portfolios.key}
        id={localStorageState.portfolios[i].props.id}
        onClick={(id) => this.handleClicks(id)}
        />
        )
      }
      const nextId = localStorageState.nextId;
    this.state = {
      portfolioCount:portfolioCount,
      portfolios:portfolios,
      nextId: nextId,
    };
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
