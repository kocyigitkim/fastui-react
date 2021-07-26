import React, { Component } from 'react'
import { IDataSource } from '../DataSource'
import { chooseOne, translate } from '../utils';
import { CustomField } from './Form'
import ReactSelect from 'react-select2-wrapper'
import 'react-select2-wrapper/css/select2.min.css'

var __rawStyleChild = global.window.document.createElement("style");
__rawStyleChild.innerText = `span.select2-selection,.select2-container--default  .select2-selection__rendered,.select2-container--default  .select2-selection__arrow {height: calc(1.5em + 1.3rem + 2px);line-height: calc(1.5em + 1.3rem + 2px);}span.select2-selection .select2-selection__choice{max-height: calc(1.5em + 1.3rem - 4px);position: relative;top: 2px;line-height: initial !important;display: inline-flex;align-items: center;}`;
global.window.document.head.appendChild(__rawStyleChild);

export default class ComboBoxField extends CustomField {
    state = {
        options: [],
        loading: false
    };
    constructor(props) {
        super(props);
        this.getDataSource = this.getDataSource.bind(this);
    }
    async componentDidMount() {
        this.setState({ loading: true });

        const labelSelector = this.props.labelSelector || ((k) => chooseOne(k.Name, k.Title, k.Label, k.name, k.title, k.label));
        const valueSelector = this.props.valueSelector || ((k) => chooseOne(k.Id, k.Value, k.Code, k.id, k.value, k.code));
        const dataSource = this.getDataSource();
        if (!dataSource) return;

        if (await dataSource.retrieve()) {
            this.setState({
                options: dataSource.records.map(item => ({
                    text: labelSelector(item),
                    id: valueSelector(item)
                })),
                loading: false
            });
        }
        else {
            this.setState({
                options: [],
                loading: false
            });
        }
    }
    /**
     * @returns {IDataSource}
     * */
    getDataSource() {
        return this.props.datasource;
    }
    form() {
        const { type, placeholder, title, name, description } = this.props;
        const translated = translate(title || name);
        return (
            <div className="form-group">
                {title && <div className="form-label">{translated}</div>}
                <ReactSelect {...this.props} multiple={this.props.multiple} placeholder={placeholder && translate(placeholder)} style={{ width: '100%' }} placeholder={translate(this.props.title)} data={this.state.options} isLoading={this.state.loading}></ReactSelect>
                {description && <div className="text-muted">{translate(description)}</div>}
            </div>
        )
    }
}
