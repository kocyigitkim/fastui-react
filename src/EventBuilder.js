export class EventArgs { }
export class ErrorEventArgs {
    error = null;
    /**
     * 
     * @param {Error} error 
     */
    constructor(error) {
        this.error = error;
    }
}

/**
 * 
 * @param {Object} target 
 * @param {EventArgs} eventArgs
 */
export function EventHandler(target, eventArgs) {
    return null;
}
export class EventBuilder {
    constructor() {
        this.handlers = [];
    }
    add(handler) {
        this.handlers.push(handler);
    }
    remove(handler) {
        var index = this.handlers.indexOf(handler);
        if (index === -1) return;
        this.handlers.splice(index, 1);
    }
    async invoke(sender, args) {
        var results = [];
        for (var handler of this.handlers) {
            var _result = handler.call(sender, args);
            if (_result instanceof Promise) _result = await _result.catch(console.error);
            results.push(_result);
        }
        return results;
    }
}