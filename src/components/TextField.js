import React from 'react';
import { CustomField } from './Form';
import { translate } from '../utils';
import moment from 'moment';

export class TextField extends CustomField {
    grid() {
        const { title, name, value, type } = this.props;
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
        else if(type==="money"){
            return <div>unsupported datatype(money)</div>;
        }
        return <div>{(value || "").toString()}</div>;
    }
    form() {
        const { type, placeholder, title, description } = this.props;
        const translated = translate(title);
        return <div className="form-group">
            {title && <div className="form-label">{translated}</div>}
            <input className="form-control" {...this.props} title={translated} />
            {description && <div className="text-muted">{translate(description)}</div>}
        </div>;
    }

}

