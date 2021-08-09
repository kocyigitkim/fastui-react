import React, { Component, Fragment } from 'react'
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { ReactBridge } from '../ReactBridge';

export default class FastUIProvider extends Component {
    render() {
        return (
            <ReactBridge>
                <Suspense fallback={() => null}>
                 <Toaster position="top-center" reverseOrder={false} />
                 </Suspense>
                {this.props.children}
            </ReactBridge>
        )
    }
}
