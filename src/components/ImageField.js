import React, { Component } from 'react'
import { getElevation } from '../utils';
import { CustomField } from './CustomField'
import Loading from './Loading';
import color from 'color';

function getImageSize(size = "md") {
    const sizeRanges = {
        'xs': { width: 32, height: 32 },
        'sm': { width: 64, height: 64 },
        'md': { width: 128, height: 128 },
        'lg': { width: 256, height: 256 },
        'xl': { width: 484, height: 484 }
    };
    return sizeRanges[size];
}

export default class ImageField extends CustomField {
    state = {
        show: false,
        backgroundImage: null
    };
    imageBackfield = new Image();
    imageUrl = null;
    componentDidMount() {
        this.imageBackfield.onloadstart = this.imageOnLoadStart.bind(this);
        this.imageBackfield.onload = this.imageOnLoad.bind(this);
        this.componentDidUpdate.call(this);
    }
    async imageOnLoadStart() {
        this.setState({ show: true });

        const blob = await fetch(this.currentSrc,
            {
                method: 'GET'
            }).then((x) => x.blob()).catch(console.error);
        try {
            var reader = new FileReader();
            reader.onloadend = (function () {
                var base64data = reader.result;
                this.imageUrl = base64data;
                this.imageOnLoad.call(this);
            }).bind(this);
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error(err);
        }
    }
    imageOnLoad() {
        this.setState({ show: false });
    }
    componentDidUpdate() {
        if (this.currentSrc !== this.props.value) {
            this.currentSrc = this.props.value;
            this.imageOnLoadStart.call(this);
        }
    }
    renderImage(props, renderMode) {
        const { size, mode, elevation, elevationColor, radius } = props;
        const style = {
            borderRadius: radius || 6,
            boxShadow: getElevation(elevation || 1, elevationColor),
            border: `1px solid ${color(elevationColor || '#000').alpha(0.1)}`,
            ...getImageSize(size),
            backgroundImage: `url(${this.imageUrl})`,
            backgroundSize: mode || 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden'
        };
        return <div style={style}>
            <Loading show={this.state.show} />
        </div>;
    }
    grid(props) {
        return this.renderImage.call(this, props, 'grid');
    }
    form(props) {
        return this.renderImage.call(this, props, 'form');
    }
}
