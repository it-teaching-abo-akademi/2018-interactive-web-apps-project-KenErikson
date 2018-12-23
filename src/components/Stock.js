import React, { Component } from 'react';

class Stock extends Component {
    constructor(props) {
        super(props);
        this.DECIMALS_UNIT = 3;
        this.DECIMALS_TOTAL = 2;
    }

    toggleSelected() {
        this.props.toggleSelectedStock(this.props.name);
    }

    render() {
        const DIVIDER_UNIT = 10 ** this.DECIMALS_UNIT;
        const DIVIDER_TOTAL = 10 ** this.DECIMALS_TOTAL;
        const showingEuros = this.props.isShowingEruos();
        var exchangeRate = 1;
        if (showingEuros) {
            exchangeRate = this.props.getExchangeRate();
        }
        return (
            <tr>
                <td className="large-col">{this.props.name}</td>
                <td className="large-col">{parseInt(this.props.price * exchangeRate * DIVIDER_UNIT) / DIVIDER_UNIT}</td>
                <td className="small-col">{this.props.quantity}</td>
                <td className="large-col">{parseInt(this.props.price * exchangeRate * this.props.quantity * (DIVIDER_TOTAL)) / (DIVIDER_TOTAL)}</td>
                <td className="small-col"><input type="checkbox" name="selected" value="selected" onChange={() => this.toggleSelected()} checked={this.props.selected} /></td>
            </tr>
        );
    }
}


export default Stock;