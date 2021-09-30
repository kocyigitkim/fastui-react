import React, { Component, Fragment } from 'react'
import { getRouteStatus } from '../utils';
import equal from 'deep-equal'

export default class CustomRoute extends Component {
    currentRoute = null;
    componentDidMount() {
        this.getCurrentState = this.getCurrentState.bind(this);
    }

    render() {
        var { isMatched, location, a, isReset } = this.getCurrentState();
        var Content = this.props.component;
        var location = { path: location, parts: a, args: a.routes[a.routes.length - 1] };
        if (typeof Content !== 'function') {
            if (this.props.setLocation) {
                if (this.props.getLocation) {
                    const currentLocation = this.props.getLocation();
                    if ((!currentLocation || !location) || currentLocation && location && (currentLocation.path !== location.path)) {
                        this.props.setLocation(location);
                    }
                }
            }
        }
        return (
            <Fragment>
                {(isMatched || this.props.override) ? ((typeof Content === 'function') ? <Content location={location}></Content> : Content) : null}
            </Fragment>
        )
    }

    getCurrentState() {
        return getRouteStatus(this.props.path, this.props.action);
    }
}
