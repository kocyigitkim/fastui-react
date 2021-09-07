import React from 'react';
import { CustomField } from "./CustomField";
import { translate } from '../utils';
import { v4 as uuid } from 'uuid'
import Toggle from 'react-bootstrap-toggle';


export class CheckBoxField extends CustomField {
    id = "chk" + uuid().replace(/\{|\}|\-/g, "");
    grid(props) {
        const value = this.props.value || props.value;
        return <div>{translate(value !== null && value !== undefied ? ('CHECK.'(value ? 'TRUE' : 'FALSE')) : "CHECK.FALSE").toString()}</div>;
    }
    componentDidMount() {
        window.jQuery("#" + this.id).bootstrapToggle();
    }
    componentDidUpdate() {
        window.jQuery("#" + this.id).bootstrapToggle();
    }
    form(props) {
        var newProps = {};
        const { type, placeholder, title, description, value } = newProps = { ...this.props, ...props };
        const translated = translate(title);
        console.log('value', value);
        return <div className="form-group">
            {title && <div className="form-check-label" htmlFor={this.id}>{translated}</div>}
            {/* <input {...newProps} className="form-control" type="checkbox" data-toggle="toggle" checked={Boolean(value)} title={translated} id={this.id} data-off={translate("CHECKBOX.OFF")} data-on={translate("CHECKBOX.ON")} /> */}
            <Toggle
                onClick={newProps.onChange && newProps.onChange.bind(this, !Boolean(newProps.value))}
                on={<span>{translate('CHECKBOX.ON')}</span>}
                off={<span>{translate('CHECKBOX.OFF')}</span>}
                height={40}
                width={80}
                active={Boolean(newProps.value)}
            />
            {description && <div className="text-muted">{translate(description)}</div>}
        </div>;
    }

}
