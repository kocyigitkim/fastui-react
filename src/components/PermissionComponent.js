import React, { Component, Fragment } from "react";
import { getPermissionBuilder } from "../utils";

export class PermissionComponent extends Component {
    isGranted = false;
    componentDidMount() {
        this.checkPermission = this.checkPermission.bind(this);
        this.checkPermission();
        getPermissionBuilder().onRetrieve.add(this.checkPermission);
    }
    componentWillUnmount(){
        getPermissionBuilder().onRetrieve.remove(this.checkPermission);
    }
    async checkPermission() {
        const permissionBuilder = getPermissionBuilder();
        var isGranted = permissionBuilder.check(this.props.className, this.props.actionName);
        if (this.state.isGranted !== isGranted) {
            this.setState({
                isGranted: isGranted
            });
        }
    }
    render() {
        return <Fragment>{this.state.isGranted && this.props.children}</Fragment>;
    }
}