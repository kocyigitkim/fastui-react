import React, { Component } from 'react'

import LoadingCSS from './styles/Loading.css';
import Spinner from 'react-spinner-material';
import color from 'color';


export default class Loading extends Component {
    componentDidMount() {
        var internalFiber = this._reactInternalFiber || this._reactInternals;
        if (!internalFiber) return;

        this.parentNode = internalFiber.return.stateNode;
        this.currentNode = internalFiber.child.stateNode;
        this.parentNode.style.position = 'relative';


        var computedParent = window.getComputedStyle(this.parentNode);
        this.currentNode.style.borderRadius = computedParent.borderRadius;
    }
    render() {
        const backColor = color(this.props.bg || 'white').alpha(0.5);

        return (
            <div style={{ opacity: (this.props.show ? 1 : 0), pointerEvents: (this.props.show ? 'all' : 'none'), color: (this.props.color || 'black'), backgroundColor: backColor }} className={LoadingCSS.__react__loadingcontent}>
                <div style={{ zIndex: 400002, position: 'relative' }}>
                    <div style={{ display: 'block', display: 'flex', justifyContent: 'center', margin: 20 }}>
                        <Spinner radius={25} stroke={3} {...this.props} children={null}></Spinner>
                    </div>
                    <div style={{ display: 'block', fontWeight: 'bold' }}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}