import React from 'react';
import { CustomField } from "./CustomField";
import { translate } from '../utils';


export class ButtonField extends CustomField {
    grid(props) {
        return this.form(props);
    }
    onMouseMove = ((evt) => {
        this.glowDiv.style.opacity = 0.3;
        var rect = evt.target.getBoundingClientRect();
        this.glowDiv.style.left = (evt.clientX - 128 - rect.x) + 'px';
        this.glowDiv.style.top = (evt.clientY - 128 - rect.y) + 'px';
    }).bind(this);
    onMouseLeave = ((evt) => {
        this.glowDiv.style.opacity = 0;
    }).bind(this);
    form(props) {
        const { color, outlined, outline, title, left, right } = this.props;
        const translated = translate(title);
        return (<button {...props} onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave} onClick={(evt) => { this.props.onClick && this.props.onClick.call(this, this.props, evt) }} className={`btn btn${(outlined || outline) ? '-outline' : ''}-${(color || "secondary")}`} title={translated} style={{ ...this.props.style, position: 'relative', overflow: 'hidden' }}>
            <div style={{
                pointerEvents: 'none',
                position: 'absolute',
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,0,0,0) 50%)',
                transition: 'opacity 300ms ease',
                width: 256,
                height: 256,
                borderRadius: 256,
                opacity: 0
            }} ref={r => this.glowDiv = r}></div>
            {left}{translated}{right}
        </button>);
    }

}
