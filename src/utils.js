
import { FastApiClient } from "fastapi-express-client";
import { PermissionBuilder } from "./PermissionBuilder";
import color from 'color';

import select2totreePackage from './select2totree.js';
import State from 'faststate-react/states/State';
import { FileProvider } from "./FileProvider";
import FastState from "faststate-react";
import { RouteBuilder } from "./RouteBuilder";
export function initializeSelect2ToTree(jQuery) {
    select2totreePackage(jQuery);
}
export function isPermissionCheckEnabled() {
    return Boolean(global.window.fastui.permissionCheckEnabled);
}
export function getRouteStatus(route, action, actionOptional = false, classOptional = true) {
    const location = window.location.pathname;
    const a = new RouteBuilder();
    var b = (route || "").split('/').map(p => p.trim()).filter(p => p.length > 0);
    var isReset = false;
    if (b.length > 0 && b[0].startsWith('reset:')) {
        isReset = true;
        b[0] = b[0].substr(6);
    }
    a.parse(location);
    const bMatch = b.filter((p, i) => a.routes[i] && a.routes[i].className === p).length;
    var isMatched = b.length == 1 ? bMatch == 1 : (bMatch >= b.length - 1 + (classOptional ? 0 : 1));
    if ((isMatched && a.routes[b.length - 1] && a.routes[b.length - 1].actionName === action) === false) {
        if (!actionOptional) {
            isMatched = false;
        }
    }
    if (b.length === 0) isMatched = false;
    if (action !== "list" && bMatch < b.length) isMatched = false;

    var result = { isMatched, location, a, b, isReset };

    return result;
}
export function getHistory() {
    return global.window.fastui.useHistory;
}
/**
 * 
 * @returns {State}
 */
export function getRouterState() {
    return global.window.fastui.routerState;
}
export function getReact() {
    return global.window.fastui.react;
}
export function redirectTo(path, args) {
    const router = getRouterState();
    router.oldid = router.id;
    FastState.setState(router, {
        path: path,
        args: args,
        id: uuidv4()
    });
}
export function getRouteParams() {
    const router = getRouterState();
    return {
        path: router.path,
        args: router.args
    };
}
/**
 * @returns {FastApiClient}
 */
export function getApiHandler() {
    return global.window.fastui.apiHandler;
}
/**
 * 
 * @returns {FileProvider}
 */
export function getFileProvider() {
    return global.window.fastui.fileProvider;
}
/**
 * 
 * @returns {PermissionBuilder}
 */
export function getPermissionBuilder() {
    return global.window.fastui.permissionBuilder;
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function translate(...args) {
    return global.window.fastui.translate(...args);
}
export function chooseOne(...args) {
    for (var arg of args) {
        if (arg !== null && arg !== undefined) return arg;
    }
    return null;
}
export function getElevation(elevation = 0, elevationColor = '#000') {
    return `0px ${(elevation * 1.25).toFixed(2)}px ${(elevation * 5).toFixed(2)}px ${(elevation * 1.5).toFixed(2)}px ${color(elevationColor).alpha((elevation > 0 ? 0.01 : 0) + elevation * 0.03)}`;
}
export function registerStylesheet(css) {
    var __rawStyleChild = global.window.document.createElement("style");
    __rawStyleChild.innerText = css;
    global.window.document.head.appendChild(__rawStyleChild);
}

export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

/** @returns {State} */
export function getDialogContainer() {
    if (!global.window.fastui.dialogContainer) {
        var state = new State();
        state.dialogs = [];
        global.window.fastui.dialogContainer = state;
    }
    return global.window.fastui.dialogContainer;
}