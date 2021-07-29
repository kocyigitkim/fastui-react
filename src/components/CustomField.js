import React, { Component, Fragment } from 'react';
import { translate } from '../utils';


export class CustomField extends Component {
    grid(props) {
        const { title, name } = this.props;
        const translated = translate(title || name);
        return <div {...props}>{translated}</div>;
    }
    form(props) {
        return this.grid.call(this, props);
    }
    render() {
        var renderMode = "form";
        var internalFiber = this._reactInternalFiber || this._reactInternals;
        if (!internalFiber)
            return <Fragment></Fragment>;
        var parentElement = internalFiber.return && internalFiber.return.stateNode;
        if (!parentElement)
            return <Fragment></Fragment>;
        parentElement = (parentElement._reactInternalFiber || parentElement._reactInternals).return;
        if (parentElement.elementType === 'tr' || parentElement.elementType === 'th' || parentElement.elementType === 'td') { renderMode = "grid"; }
        const hide = (this.props.hide || "").split(",");
        if (hide.indexOf("grid") > -1 && renderMode == "grid") {
            return <Fragment></Fragment>;
        }
        var props = { ...this.props };
        if (props.readonly) { props.disabled = true; }
        return renderMode === 'form' ? this.form.call(this, props) : this.grid.call(this, props);
    }
}
