import React from 'react';
import { CustomField } from "./CustomField";
import { translate } from '../utils';
import moment from 'moment';

export class TextField extends CustomField {
    grid(props) {
        const { title, name, value, type } = { ...this.props, ...props };
        if (type === "email") {
            return <div><a href={`mailto:${value}`}>{value}</a></div>
        }
        else if (type === "tel") {
            return <div><a href={`tel:${value}`}>{value}</a></div>
        }
        else if (type === "date" || type === "datetime" || type === "time") {
            var format = translate("FORMAT." + { 'date': 'DATE', 'datetime': 'DATETIME', 'time': 'TIME' }[type]);
            return <div>{moment(value).format(format)}</div>;
        }
        else if (type === "money") {
            return <div>unsupported datatype(money)</div>;
        }
        return <div>{(value || "").toString()}</div>;
    }
    form(props) {
        var newProps = {};
        var { type, placeholder, title, value, description, multiline } = newProps = { ...this.props, ...props };
        const translated = translate(title);
        if (type == "date" || type == "datetime") {
            value = value !== undefined && value !== null && moment(value).toDate();
        }
        return <div className="form-group">
            {title && <div className="form-label">{translated}</div>}
            {multiline ? (
                <textarea className="form-control" {...newProps} title={translated}></textarea>
            ) : (<input className="form-control" {...newProps} title={translated} />)}
            {description && <div className="text-muted">{translate(description)}</div>}
        </div>;
    }

}

