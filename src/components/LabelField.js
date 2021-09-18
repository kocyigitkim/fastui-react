import React, { Component } from 'react'
import { translate } from '../utils'

export default class LabelField extends Component {
    render() {
        return (translate(this.props.value || ""));
    }
}
