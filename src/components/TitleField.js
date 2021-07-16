import React, { Component } from 'react'
import { translate } from '../utils';
import { CustomField } from './Form'

export default class TitleField extends CustomField {
    render() {
        const { title } = this.props;
        const translated = translate(title);
        return (
            <div>
                <h5 className="text-dark font-weight-bold">{translated}</h5>
                <hr />
            </div>
        )
    }
}
