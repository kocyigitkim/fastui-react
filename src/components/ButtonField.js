import React from 'react';
import { CustomField } from "./CustomField";
import { translate } from '../utils';


export class ButtonField extends CustomField {
    grid(props) {
        return this.form(props);
    }
    form(props) {
        const { color, outlined, title, left, right } = this.props;
        const translated = translate(title);
        return <button {...{ ...props, title: translated }} onClick={(evt) => { this.props.onClick && this.props.onClick.call(this, this.props, evt) }} className={`btn btn${outlined ? '-outline' : ''}-${(color || "secondary")}`}>{left}{translated}{right}</button>;
    }

}
