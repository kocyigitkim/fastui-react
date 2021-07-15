import React, { Component } from 'react'

import LoadingCSS from './styles/Loading.css';
import Spinner from 'react-spinner-material';
import color from 'color';


export default class Loading extends Component {
    componentDidMount() {
        if(!this._reactInternalFiber) return;
        
        this.parentNode = this._reactInternalFiber.return.stateNode;
        this.currentNode = this._reactInternalFiber.child.stateNode;
        this.parentNode.style.position = 'relative';

        var computedParent = window.getComputedStyle(this.parentNode);
        this.currentNode.style.borderRadius = computedParent.borderRadius;
    }
    render() {
        const backColor = color(this.props.bg || 'white').alpha(0.5);

        return (
            <div style={{ opacity: (this.props.show ? 1 : 0), pointerEvents: (this.props.show ? 'all' : 'none'), color: (this.props.color || 'black'), backgroundColor: backColor }} className={LoadingCSS.__react__loadingcontent}>
                <div>
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