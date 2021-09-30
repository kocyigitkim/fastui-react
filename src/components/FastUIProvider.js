import React, { Component, Fragment, useEffect } from 'react'
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { ReactBridge } from '../ReactBridge';
import { getHistory, getReact, getRouterState } from '../utils';
import { FastDialogContainer } from './Dialog';

export default class FastUIProvider extends Component {
    render() {
        return (
            <Fragment>
                <ReactBridge>
                    <Suspense fallback={() => null}>
                        <Toaster position="top-center" reverseOrder={false} />
                        <FastDialogContainer></FastDialogContainer>
                    </Suspense>
                    {this.props.children}
                </ReactBridge>
                <FastUIRouter></FastUIRouter>
            </Fragment>
        )
    }
}

function FastUIRouter(props) {
    const [index, setIndex] = getReact().useState(0);
    const history = getHistory()();
    const state = getRouterState();
    getReact().useEffect(() => {
        if (state.faststate_components.length === 0) {
            state.register({ forceUpdate: () => setIndex(index + 1) });
        }

        return () => {
            state.faststate_components.splice(0, 1);
        };
    })
    if (state.oldid !== state.id) {
        history.push(state.path);
        state.oldid = state.id;
    }
    return <></>;
}