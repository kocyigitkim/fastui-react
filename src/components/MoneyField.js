import React, { Component } from 'react'
import { CustomField } from './CustomField'
import { translate } from '../utils';
import * as Bootstrap from 'bootstrap';
import { v4 as uuid } from 'uuid';

const predefinedCurrency = {
    'USD': {
        symbol: '$',
        decimal: ',',
        thousand: '.',
        precision: 2,
        format: '%s%v',
        symbolDirection: 'left'
    },
    'EUR': {
        symbol: '€',
        decimal: ',',
        thousand: '.',
        precision: 2,
        format: '%s%v',
        symbolDirection: 'left'
    },
    'TRY': {
        symbol: '₺',
        decimal: ',',
        thousand: '.',
        precision: 2,
        format: '%s%v',
        symbolDirection: 'left'
    }
};

function UnformatCurrency(currency, value) {
    if (value.length === 0) return 0;
    var decimals = "";
    var symbol = currency.symbolDirection === 'right' ? value.substr(value.length - 1, 1) : value.substr(0, 1);
    if (symbol !== currency.symbol && value.length === 1) {
        symbol = "";
    }
    else {
        value = currency.symbolDirection === 'right' ? value.substr(0, value.length - 1) : value.substr(1);
    }
    if (value === null || value === undefined) value = "";

    var parts = value.split("");
    var decimalCount = parts.indexOf(currency.decimal);
    if (decimalCount === -1) decimalCount = value.length;

    var decimalPrecision = parts.slice(decimalCount + 1, parts.length).join("");
    decimals = (parts.slice(0, decimalCount).filter(p => p !== currency.thousand).join(""));
    decimalPrecision = decimalPrecision;
    return [decimals, decimalPrecision];
}

function FormatCurrency(currency, value) {
    if ((value[1] === null || value[1] === undefined) && (value[0] === null || value[0] === undefined)) value = ["0", ""];
    value[0] = value[0].split("").reverse().map((v, i, arr) => i % 3 === 2 && i < arr.length - 1 && arr.length > 3 ? '.' + v : v).reverse().join("");
    if (value[1].length === 0) {
        value[1] = '0'.repeat(currency.precision);
    }
    else {
        value[1] = value[1].substr(0, Math.min(value[1].length, currency.precision));
    }
    var formattedValue = value.join(currency.decimal);
    if (currency.symbolDirection === 'right') formattedValue = formattedValue + currency.symbol;
    else formattedValue = currency.symbol + formattedValue;

    return formattedValue;
}

export default class MoneyField extends CustomField {
    state = {
        value: '',
        currency: null
    };
    id = "k" + uuid().replace(/\-/g, "");
    FormatCurrency(currency, evt) {
        var lastSelectionStart = evt.target.selectionStart;
        if (isNaN(parseInt(evt.nativeEvent.data)) && evt.nativeEvent.inputType === "insertText") {
            evt.preventDefault();
            return;
        }

        var deletedChar = this.state.value.substr(evt.target.selectionStart, 1);
        if (deletedChar === currency.decimal && this.state.value.length > evt.target.value.length) {
            evt.preventDefault();
            this.inputRef.selectionStart = lastSelectionStart;
            this.inputRef.selectionEnd = lastSelectionStart;
            return;
        }
        var isFirstEntrance = evt.target.value.length === 1;
        var lastSelectionStart = evt.target.selectionStart;
        var unformatted = UnformatCurrency(currency, evt.target.value);
        var formatted = FormatCurrency(currency, unformatted);
        this.setState({ value: formatted }, () => {
            if (isFirstEntrance && currency.symbolDirection !== 'right') lastSelectionStart++;
            this.inputRef.selectionStart = lastSelectionStart;
            this.inputRef.selectionEnd = lastSelectionStart;
        });
        return formatted;
    }
    form(props) {
        const value = this.props.value;
        const currency = this.state.currency || (this.props.currency || (value && value.currency));
        const currencyProps = currency && predefinedCurrency[currency];
        var newProps = {};
        const { type, placeholder, title, description } = newProps = { ...this.props, ...props };
        const translated = translate(title);
        return <div className="form-group">
            {title && <div className="form-label">{translated}</div>}
            <div className="input-group">
                <div className="input-group-prepend">
                    <span class="input-group-text">
                        <div className="dropdown" style={{ margin: '-6px -12px' }}>
                            <button style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, padding: 5 }} className="btn btn-secondary dropdown-toggle" type="button" id={this.id} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                {(currencyProps && currencyProps.symbol) || "?"}
                            </button>
                            <div className="dropdown-menu" style={{ minWidth: 0 }} aria-labelledby="dropdownMenuButton">
                                {Object.keys(predefinedCurrency).map((k, i) => {
                                    var cur = predefinedCurrency[k];
                                    return <button type="button" onClick={() => {
                                        this.setState({
                                            currency: k,
                                            value: FormatCurrency(cur, UnformatCurrency(currencyProps, this.state.value))
                                        });
                                    }} className="dropdown-item">{cur.symbol}</button>
                                })}
                            </div>
                        </div>
                    </span>
                </div>
                <input ref={r => this.inputRef = r} value={this.state.value} className="form-control" alwaysShowMask title={translated} onChange={currencyProps && this.FormatCurrency.bind(this, currencyProps)} />
            </div>
            {description && <div className="text-muted">{translate(description)}</div>}
        </div>;
    }
}
