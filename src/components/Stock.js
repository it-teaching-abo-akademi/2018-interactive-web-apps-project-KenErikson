import React, { Component } from 'react';

class Stock extends Component {
    constructor(props) {
        super(props);
        this.DECIMALS_UNIT = 3;/** Decimals for 1 Unit */
        this.DECIMALS_TOTAL = 2;/**  Decimals for Calculated total of Stock*/
    }

    /** Toggle Selected State of this  Stock */
    toggleSelected() {
        this.props.toggleSelectedStock(this.props.name);
    }

    /** Render Stock */
    render() {
        /** Set Decimal Dividers */
        const DIVIDER_UNIT = 10 ** this.DECIMALS_UNIT;
        const DIVIDER_TOTAL = 10 ** this.DECIMALS_TOTAL;
        
        /** Get correct Exchange Rate */
        var exchangeRate = 1;
        const showingEuros = this.props.isShowingEruos();
        if (showingEuros) {
            exchangeRate = this.props.getExchangeRate();
        }

        /** Return <tr>-row containing one Stock */
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