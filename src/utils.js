
import { FastApiClient } from "fastapi-express-client";
import { PermissionBuilder } from "./PermissionBuilder";
import color from 'color';

import select2totreePackage from './select2totree.js';
import State from 'faststate-react/states/State';
import { FileProvider } from "./FileProvider";

export function initializeSelect2ToTree(jQuery) {
    select2totreePackage(jQuery);
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
export function getFileProvider(){
    return global.window.fastui.fileProvider;
}
/**
 * 
 * @returns {PermissionBuilder}
 */
export function getPermissionBuilder() {
    return global.window.fastui.permissionBuilder;
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
export function getDialogContainer(){
    if(!global.window.fastui.dialogContainer){
        var state = new State();
        state.dialogs = [];
        global.window.fastui.dialogContainer = state;
    }
    return global.window.fastui.dialogContainer;
}