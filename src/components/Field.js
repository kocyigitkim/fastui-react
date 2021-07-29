import React, { Component, Fragment } from 'react';


export class Field extends Component {
    static registry = {};
    static register(name, component) {
        Field.registry[name] = component;
    }
    render() {
        const { type } = this.props;
        const DynamicComponent = Field.registry[type] || Fragment;
        return <DynamicComponent {...this.props}>{this.props.children}</DynamicComponent>;
    }
}
