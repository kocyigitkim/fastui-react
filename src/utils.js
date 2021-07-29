import { FastApiClient } from "fastapi-express-client";
import { PermissionBuilder } from "./PermissionBuilder";

/**
 * @returns {FastApiClient}
 */
export function getApiHandler(){
    return global.window.fastui.apiHandler;
}
/**
 * 
 * @returns {PermissionBuilder}
 */
export function getPermissionBuilder(){
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