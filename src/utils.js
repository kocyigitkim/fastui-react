export function translate(...args) {
    return global.window.fastui.translate(...args);
}
export function chooseOne(...args) {
    for (var arg of args) {
        if (arg !== null && arg !== undefined) return arg;
    }
    return null;
}