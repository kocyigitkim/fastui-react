import React, { Component } from 'react'
import { IDataSource } from '../DataSource'
import { chooseOne, translate } from '../utils';
import { CustomField } from "./CustomField";
import ReactSelect from 'react-select2-wrapper'
import 'react-select2-wrapper/css/select2.css'

var __rawStyleChild = global.window.document.createElement("style");
__rawStyleChild.innerText = `span.select2-selection,.select2-container--default  .select2-selection__rendered,.select2-container--default  .select2-selection__arrow {height: calc(1.5em + 1.3rem + 2px) !important;line-height: calc(1.5em + 1.3rem + 2px) !important;}span.select2-selection .select2-selection__choice{max-height: calc(1.5em + 1.3rem - 4px) !important;position: relative;top: 2px;line-height: initial !important;display: inline-flex;align-items: center;}`;
global.window.document.head.appendChild(__rawStyleChild);

export default class ComboBoxField extends CustomField {
    state = {
        options: [],
        loading: false,
        inited: false
    };
    inited = false;
    constructor(props) {
        super(props);
        this.getDataSource = this.getDataSource.bind(this);
    }
    async componentDidMount() {
        if (this.inited) return;
        this.inited = true;
        this.setState({ loading: true });

        const labelSelector = this.props.labelSelector || ((k) => chooseOne(k.Name, k.Title, k.Label, k.name, k.title, k.label));
        const valueSelector = this.props.valueSelector || ((k) => chooseOne(k.Id, k.Value, k.Code, k.id, k.value, k.code));
        const dataSource = this.getDataSource();
        if (!dataSource) return;

        for (var kv in dataSource.args) {
            var v = dataSource.args[kv];
            if (typeof v === 'function') {
                dataSource.args[kv] = v.bind(this);
            }
        }

        dataSource.onRetrieve.add(((sender, args) => {
            this.setState({
                options: dataSource.records.map(item => ({
                    text: labelSelector(item),
                    id: valueSelector(item)
                })),
                loading: false,
                inited: true
            });
        }).bind(this));
        await dataSource.retrieve();
    }
    /**
     * @returns {IDataSource}
     * */
    getDataSource() {
        return this.props.datasource;
    }
    onChange(...args) {
        if (this.state.options.length === 0 && !this.state.inited) return;

        if (this.props.onChange) this.props.onChange(...args);
    }
    onOpen(evt) {

        try {
            var searchFieldId = evt.target.parentElement.querySelector(".select2-selection").getAttribute("aria-owns");
            console.log(searchFieldId);
            var el = global.window.document.querySelector("#" + searchFieldId + "").parentElement.parentElement.querySelector("input");
            if (el) {
                el.focus();
            }
        } catch (err) {
            console.error(err);
        }

    }
    form() {
        const { type, placeholder, title, name, description } = this.props;
        const translated = translate(title || name);
        return (
            <div className="form-group">
                {title && <div className="form-label">{translated}</div>}
                <ReactSelect {...this.props} onOpen={this.onOpen.bind(this)} onChange={this.onChange.bind(this)} multiple={this.props.multiple} placeholder={placeholder && translate(placeholder)} style={{ width: '100%' }} placeholder={translate(this.props.title)} data={this.state.options} isLoading={this.state.loading}></ReactSelect>
                {description && <div className="text-muted">{translate(description)}</div>}
            </div>
        )
    }
}
