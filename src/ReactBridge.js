import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export class ReactBridge extends Component {
    renderBridge() {
        ReactDOM.render(this.props.children, this.bridgeContainer);
    }
    componentDidUpdate() {
        this.renderBridge.call(this);
    }
    render() {
        return <div ref={(r) => {
            if (!this.bridgeContainer) {
                this.bridgeContainer = r;
                this.renderBridge.call(this);
            }
        }}>
        </div>;
    }
}