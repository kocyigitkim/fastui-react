import Color from 'color';
import React, { Component } from 'react'
import { translate } from '../utils';

export default class AccessDenied extends Component {
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
        const backColor = Color(this.props.bg || '#400').alpha(0.4);
        const textColor = Color(backColor).isLight() ? '#000' : '#fff';
        return (
            <div style={{
                transition: 'all 300ms cubic-bezier(.9,.01,.01,.9)',
                opacity: (this.props.show ? 1 : 0),
                pointerEvents: (this.props.show ? 'all' : 'none'),
                color: (this.props.color || 'black'),
                backgroundColor: backColor,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                backdropFilter: `blur(${(this.props.blur || 5)}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                    <label style={{ fontWeight: 'bold', color: textColor, fontSize: '4rem', marginBottom: 20 }}>403</label>
                    <label style={{ fontweight: 'bold', color: textColor }}>{translate("ACCESS.DENIED")}</label>
                </div>
            </div>
        )
    }
}
