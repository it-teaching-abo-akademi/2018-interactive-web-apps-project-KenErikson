import React, { Component } from 'react';
import './App.css';

class TextInput extends Component{
  handleInput() {
    var input = React.findDOMNode(this.refs.userInput)
    this.props.saveInput(input.value)
    input.value = ''
  }
  render() {
    var label = this.props.label
    return (
      <div class="form-group">
        <input 
          type="text" 
          class="form-control" 
          id="input-{ label }" 
          ref="userInput"
         />
        <button onClick={ this.handleInput }>Save</button>
      </div>
    )
  }
}


class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userIsEditing:false,
      title:"Portfolio "+props.id
    }
  }
  render() {
    return (
      <div className="App-Portfolio">
        <TextInput className="Portfolio-Title">Potrfolio {this.state.title}</TextInput>
        <button className="Portfolio-Button">Show in €</button>
        <button className="Portfolio-Button">Show in $</button>
        <button className="Portfolio-Button Exit" onClick={() => this.props.onClick(this.props.id)}>X</button>
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
    console.log("Handling Clicks id:" + id + " newPortfolios length:" + newPortfolios.length);
    var removed = false;
    for (var i = 0; i < newPortfolios.length; i++) {
      console.log(newPortfolios[i].props.id + ":" + id);
      if (newPortfolios[i].props.id === id) {
        newPortfolios.splice(i, 1);
        removed = true;
        break;
      }
    }

    if (!removed) {
      console.log("Nothing Removed");
    }

    this.setState(
      {
        portfolioCount: portfolioCount,
        portfolios: newPortfolios,
        nextId: nextId
      }
    );
  }

  addPortfolio() {
    const portfolioCount = this.state.portfolioCount;
    var newPortfolios = this.state.portfolios;
    const nextId = this.state.nextId;
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
