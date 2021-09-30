import React, { Component, Fragment } from 'react';
import { DynoValue } from 'faststate-react/states/DynoState';

export class Field extends Component {
    static registry = {};
    static register(name, component) {
        Field.registry[name] = component;
    }
    render() {
        const { type } = this.props;
        const DynamicComponent = Field.registry[type] || Fragment;
        var props = { ...this.props };
        try {
            if (props.value !== undefined && (props.value instanceof DynoValue || (props.value.__proto__ && props.value.__proto__.constructor && props.value.__proto__.constructor.name.toLowerCase() === 'dynovalue') || props.value.read)) {
                props.rawValue = props.value;
                props.isReferencedValue = true;
                props.value = props.value.read(this);
                const onChange = props.onChange;
                props.onChange = (function (onChange, rawValue, v, ...args) {
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
                        }
                        else {
                            v = v.target.value;
                        }
                    }
                    if (v && v.length === 1 && (v[0] === undefined || v[0] === null)) v = [];

                    if (currentValue != v) {
                        var isUpdate = true;
                        if (Array.isArray(currentValue)) {
                            if (Array.isArray(v)) {
                                if (currentValue.length == v.length) {
                                    isUpdate = false;
                                }
                            }
                        }

                        if (isUpdate) {
                            rawValue.writeUpdate(v);
                        }
                        else {
                            rawValue.write(v);
                        }
                    }
                    if (onChange) {
                        onChange(v);
                    }
                }).bind(this, onChange, props.rawValue);
            }
        } catch (err) { console.log(err) }
        return <DynamicComponent {...props}>{props.children}</DynamicComponent>;
    }
}
