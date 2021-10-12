import React, { Component, Fragment } from 'react';
import { DynoValue } from 'faststate-react/states/DynoState';
import deepEqual from 'deep-equal';

export class Field extends Component {
    static registry = {};
    static register(name, component) {
        Field.registry[name] = component;
    }
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.refresh();
    }
    componentDidMount() {
        this.refresh();
    }
    componentDidUpdate() {
        this.refresh();
    }
    refresh() {
        if(this.rawValue) return;
        const props = this.props;
        if (props.value !== undefined && props.value !== null && (props.value instanceof DynoValue || (props.value.__proto__ && props.value.__proto__.constructor && props.value.__proto__.constructor.name.toLowerCase() === 'dynovalue') || props.value.read)) {
            this.rawValue = props.value;
            if (!this.rawValue.setReference) {
                console.log('Warning: FastUI/Field.js: props.value is not a DynoValue, but has a read method. This is probably a mistake.');
                return <div>{"This is probably a mistake"}</div>;
            }
            this.rawValue.setReference(this);
            this.isReferencedValue = true;
        }
    }
    render() {
        const { type } = this.props;
        const DynamicComponent = Field.registry[type] || Fragment;
        var props = { ...this.props };
        try {
            if (this.isReferencedValue) {
                props.value = this.rawValue.read(this);
                props.rawValue = this.rawValue;
                props.isReferencedValue = true;
                props.onChange = (FieldOnChange).bind(this, props.onChange, props.rawValue);
            }
        } catch (err) { console.error(err); }
        return <DynamicComponent {...props}>{props.children}</DynamicComponent>;
    }
}

function FieldOnChange(onChange, rawValue, v, ...args) {
    var currentValue = rawValue.read();
    if (v && v.target) {

        if (v.target.type == 'checkbox' || v.target.type == 'radio') {
            v = v.target.checked;
        }
        else if (v.target.tagName == 'SELECT') {
            if (v.target.options.length === 0) return;
            var selectedIds = [];
            for (var option of v.target.selectedOptions) {
                selectedIds.push(option.value);
            }
            if (v.target.options.length > 0 && v.target.selectedOptions.length == 0 && v !== null) {
                if (currentValue === undefined)
                    selectedIds = [];
                else
                    selectedIds = Array.isArray(currentValue) ? currentValue : [currentValue];
            }
            v = selectedIds;
            if (!this.props.multiple) {
                if (Array.isArray(v)) {
                    v = v[0];
                }
            }
            else {
                if (!Array.isArray(v)) {
                    v = [v];
                }
            }
        }
        else {
            v = v.target.value;
        }
    }

    var isUpdate = !deepEqual(currentValue, v);
    if (isUpdate) {
        rawValue.writeUpdate(v);
    }
    if (!this.componentInitialValueSet && v !== undefined && v !== null) {
        this.componentInitialValueSet = true;
        isUpdate = true;
    }

    if (onChange && isUpdate) {
        onChange(v);
    }

}