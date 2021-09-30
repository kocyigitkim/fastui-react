import React, { Component } from 'react'
import { IDataSource } from '../DataSource'
import { chooseOne, initializeSelect2ToTree, translate } from '../utils';
import { CustomField } from "./CustomField";
import ReactSelect from 'react-select2-wrapper'
import { v4 as uuid } from 'uuid';
import Loading from './Loading'
export default class ComboBoxField extends CustomField {
    state = {
        options: [],
        loading: false,
        inited: false
    };
    inited = false;
    id = "cmd" + uuid().replace(/\{|\}|\-/g, "");
    constructor(props) {
        super(props);
        this.getDataSource = this.getDataSource.bind(this);
        this.updateCombobox = this.updateCombobox.bind(this);
    }
    async componentDidMount() {
        if (this.inited) return;
        this.inited = true;

        this.setState({ loading: true });

        var labelSelector = this.props.labelSelector || ((k) => chooseOne(k.Name, k.Title, k.Label, k.name, k.title, k.label));
        var valueSelector = this.props.valueSelector || ((k) => chooseOne(k.Id, k.Value, k.Code, k.id, k.value, k.code));
        if (typeof labelSelector != "function") {
            labelSelector = ((k, data) => data[k]).bind(this, labelSelector);
        }
        if (typeof valueSelector != "function") {
            valueSelector = ((k, data) => data[k]).bind(this, valueSelector);
        }
        const dataSource = this.getDataSource();
        if (!dataSource) return;

        for (var kv in dataSource.args) {
            var v = dataSource.args[kv];
            if (typeof v === 'function') {
                dataSource.args[kv] = v.bind(this);
            }
        }
        dataSource.onBeginRetrieve.add(() => {
            this.setState({ loading: true });
        });
        dataSource.onRetrieve.add(((sender, args) => {
            this.setState({
                options: dataSource.records.map(item => ({
                    text: translate(labelSelector(item)),
                    id: valueSelector(item)
                })),
                loading: false,
                inited: true
            }, () => {
                this.updateCombobox();
            });
        }).bind(this));
        await dataSource.retrieve();
    }
    updateCombobox() {
        const dataSource = this.getDataSource();
        if (!dataSource) return;

        var labelSelector = this.props.labelSelector || ((k) => chooseOne(k.Name, k.Title, k.Label, k.name, k.title, k.label));
        var valueSelector = this.props.valueSelector || ((k) => chooseOne(k.Id, k.Value, k.Code, k.id, k.value, k.code));
        if (typeof labelSelector != "function") {
            labelSelector = ((k, data) => data[k]).bind(this, labelSelector);
        }
        if (typeof valueSelector != "function") {
            valueSelector = ((k, data) => data[k]).bind(this, valueSelector);
        }
        const selectedValues = (this.props.value || []);

        if (this.props.nested) {
            const nestedProperty = "ParentId";
            const nestedBuilder = typeof this.props.nested === 'function' ? (this.props.nested) : ((data) => {
                var result = [];
                const connectParent = (record) => {
                    var subitems = data.filter(p => p[nestedProperty] === valueSelector(record));
                    var newRecord = {
                        id: valueSelector(record),
                        text: labelSelector(record)
                    };
                    if (Array.isArray(selectedValues) && selectedValues.indexOf(newRecord.id) > -1) {
                        newRecord.selected = true;
                    }
                    for (var i = 0; i < subitems.length; i++) {
                        subitems[i] = connectParent(subitems[i]);
                    }
                    newRecord.inc = subitems;
                    return newRecord;
                };
                for (var item of data.filter(p => {
                    var v = p[nestedProperty];
                    return v === null | v === undefined;
                })) {
                    result.push(connectParent(item));
                }
                return result;
            });

            const select2El = this.selectRef.el;
            if (select2El) {
                const jQ = select2El.constructor;
                if (!select2El.initialized) initializeSelect2ToTree(jQ);
                select2El.initialized = true;
                jQ.fn.select2ToTree.call(select2El, { treeData: { dataArr: nestedBuilder(dataSource.records) } });
            }
        }
    }
    /**
     * @returns {IDataSource}
     * */
    getDataSource() {
        return this.props.datasource;
    }
    onChange(value, setPermanently) {
        if (this.state.options.length === 0 && !this.state.inited) return;

        if (value && value.target) {
            var selectedIds = [];
            for (var option of value.target.selectedOptions) {
                selectedIds.push(option.value);
            }

            value = selectedIds;
        }
        if (setPermanently || (value & (Array.isArray(value) ? (value.length > 0 || ((Array.isArray(this.props.value) && this.props.value.length != value.length) || !this.props.value)) : true))) {
            if (this.props.onChange) this.props.onChange(value);
        }

    }
    onOpen(evt) {

        try {
            var searchFieldId = evt.target.parentElement.querySelector(".select2-selection").getAttribute("aria-owns");
            var el = global.window.document.querySelector("#" + searchFieldId + "").parentElement.parentElement.querySelector("input");
            if (el) {
                el.focus();
            }
        } catch (err) {
            console.error(err);
        }

    }
    form() {
        const { type, placeholder, title, name, description, disabled } = this.props;
        const translated = translate(title || name);
        const value = Array.isArray(this.props.value) ? (this.props.value.length === 0 ? null : this.props.value) : this.props.value;
        const existsValue = Boolean(value !== null && value !== undefined && (Array.isArray(value) ? value.length > 0 : true));
        return (
            <div className="form-group">
                <Loading show={this.state.loading} />
                {title && <div className="form-label">{translated}</div>}
                <div style={{ display: 'flex', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                        {disabled === true ? (
                            <div>
                            </div>
                        ) : (
                            <ReactSelect {...this.props} value={value} ref={r => this.selectRef = r} onOpen={this.onOpen.bind(this)} multiple={this.props.multiple} style={{ width: '100%' }} placeholder={translate(this.props.title)} data={(!this.props.nested && this.state.options) || []} isLoading={this.state.loading} id={this.id}></ReactSelect>
                        )}
                    </div>
                    {(disabled !== true && existsValue) ? (<div style={{ display: 'inline-block', marginLeft: 5 }}>
                        <button tabIndex="-1" type="button" className="btn btn-outline-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={this.onChange.bind(this, this.props.nested ? [] : null, true)}><i className="bi bi-x" style={{ fontSize: '1.5rem', padding: 0 }}></i></button>
                    </div>) : (<div></div>)}
                </div>
                {description && <div className="text-muted">{translate(description)}</div>}
            </div>
        )
    }
}
