import { EventBuilder } from './EventBuilder';
export class IDataSource {
    records = [];
    onRetrieve = new EventBuilder();
    get count() {
        return this.records.length;
    }
    async retrieve() {
        this.records = [];
        await this.onRetrieve.invoke(this, this.records);
        return false;
    }
}
export class LocalDataSource extends IDataSource {
    constructor(records) {
        super();
        this.records = records || [];
    }
    async retrieve() {
        await this.onRetrieve.invoke(this, this.records);
        return true;
    }
}
export class RemoteDataSource extends IDataSource {
    constructor(className, actionName, method, args, requiredArgs = false) {
        super();
        this.className = className;
        this.actionName = actionName;
        this.method = method;
        this.args = args;
        this.requiredArgs = requiredArgs;
    }
    async retrieve() {
        var generatedArgs = {};
        for (var k in this.args) {
            var v = this.args[k];
            if (typeof v === "function") {
                try {
                    v = v(this);
                    if (v instanceof Promise) {
                        v = await v.catch(console.error);
                    }
                } catch (err) { console.error(err); v = undefined; }
            }
            if (v !== undefined)
                generatedArgs[k] = v;
        }
        if (Object.keys(generatedArgs).length === 0 && this.requiredArgs) {
            this.records = [];
            await this.onRetrieve.invoke(this, []);
            return true;
        }
        var result = await global.window.fastui.apiHandler.execute(this.className, this.actionName, generatedArgs, this.method);
        if (result && (result.success || result.Success)) {
            result = result.data || result.result || result.results || result.Data || result.Result || result.Results;
        }
        this.records = result;
        await this.onRetrieve.invoke(this, result);
        return true;
    }
}