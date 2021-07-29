import color from 'color';

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
export function registerStylesheet(css){
    var __rawStyleChild = global.window.document.createElement("style");
    __rawStyleChild.innerText = css;
    global.window.document.head.appendChild(__rawStyleChild);
}