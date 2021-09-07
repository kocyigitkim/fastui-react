import React, { Component, Fragment } from 'react';
import { DynoValue } from 'faststate-react/states/DynoState';
import { translate } from '../utils';
import { validate, validateMultiple } from '../validation';

export class CustomField extends Component {

    grid(props) {
        const { title, name, value } = this.props;
        return <div {...props}>{value}</div>;
    }
    form(props) {
        return this.grid.call(this, props);
    }
    constructor(props) {
        super(props);
        this.getFormField = this.getFormField.bind(this);
        this.setFormField = this.setFormField.bind(this);
        this.getFieldProps = this.getFieldProps.bind(this);
    }

    getFormField(...args) {
        const f = this.props.form;
        return f ? f.getFormField(...args) : this.props.getFormField(...args);
    }
    setFormField(...args) {
        const f = this.props.form;
        return f ? f.setFormField(...args) : this.props.setFormField(...args);
    }
    getFieldProps(...args) {
        const f = this.props.form;
        return f ? f.getFieldProps(...args) : this.props.getFieldProps(...args);
    }
    onChangeValidation(evt) {
        const value = (evt && evt.target ? (evt.target.type === 'checkbox' || evt.target.type === 'radio' ? evt.target.checked : evt.target.value) : evt) || (this.props && this.props.value) || (this.state && this.state.value);
        const validateProps = this.props.validate;
        const isRequired = this.props.required;
        if (validateProps) {
            if (Array.isArray(validateProps)) {

            }
            else {
                this.setState({ validation: validate(value, validateProps.type, validateProps) });
            }
        }

        if (this.props.onChange) this.props.onChange(evt);
    }
    isValidated() {
        if (this.state && this.state.validation) {
            if (Array.isArray(this.state.validation)) {
                if (this.props.validateAll && this.state.validation.filter(p => p.success).length === this.state.validation.length) {
                    return true;
                }
                else if (this.state.validation.filter(p => p.success).length > 0) {
                    return true;
                }
            }
            else {
                return this.state.validation.success;
            }
        }
        return false;
    }
    getValidationErrorMessages() {
        if (this.state && this.state.validation) {
            if (Array.isArray(this.state.validation)) {
                return this.state.validation.filter(p => !p.success).map(p => p.message).join("\n");
            }
            else {
                return this.state.validation.message;
            }
        }
        return null;
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
        if (parentElement.elementType === 'tr' || parentElement.elementType === 'th' || parentElement.elementType === 'td' || ((parentElement.pendingProps || {}).className || "").indexOf("datagrid-cell") > -1) { renderMode = "grid"; }
        const hide = (this.props.hide || "").split(",");
        if (hide.indexOf("grid") > -1 && renderMode == "grid") {
            return <Fragment></Fragment>;
        }
        var props = { ...this.props };
        if (props.readonly) { props.disabled = true; }
        if (props.onChange) { props.onChange = this.onChangeValidation.bind(this); };
        const rendered = renderMode === 'form' ? this.form.call(this, props) : this.grid.call(this, props);
        if (renderMode === 'grid') return rendered;
        const isValidateDefined = Boolean(this.props.validate);
        var errorClass = "";

        var errorMessage = (this.getValidationErrorMessages() || "").trim();
        if (errorMessage.length > 0) {
            errorMessage = errorMessage.split("\n").map(p => translate(p.trim())).join(", ").trim();
        }

        var isValidated = this.isValidated();

        if (!isValidated && props.value && isValidateDefined && errorMessage.length > 0) {
            errorClass = "fastui-validation-error";
        }
        else if (isValidated && props.value && isValidateDefined) {
            errorClass = "fastui-validation-success";
        }

        return <div className={errorClass}>
            {rendered}
            {props.required && <div className="fastui-validation-required" style={{ position: 'relative', top: (props.description || "").trim().length > 0 ? 0 : -15 }}>{translate("VALIDATION.REQUIRED")}</div>}
            {(errorMessage.length > 0 && !isValidated) && <div className="fastui-validation-error-message">{errorMessage}</div>}
        </div>;

    }
}
