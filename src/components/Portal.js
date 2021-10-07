import React, { Component } from 'react'

export default class Portal extends Component {
    render() {
        return (
            <div {...this.props} style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 9910,
                ...this.props.style
            }}>
                {this.props.children}
            </div>
        )
    }
}
