import React, { Component } from 'react'
import { Fragment } from 'react';
import { translate } from '../utils';
import { CustomField } from "./CustomField";

export default class TitleField extends CustomField {
    grid() {
        return <Fragment></Fragment>;
    }
    form() {
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
