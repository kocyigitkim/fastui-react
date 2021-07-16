import FastState from 'faststate-react';
export class IDataSource extends FastState {
    records = [];
    get count() {
        return this.records.length;
    }
    async retrieve() {
        this.records = [];
        return false;
    }
}
export class LocalDataSource extends IDataSource {
    constructor(records) {
        super();
        this.records = records || [];
    }
    async retrieve() {
        return true;
    }
}
export class RemoteDataSource extends IDataSource {
    constructor(className, actionName, method, args) {
        super();
        this.className = className;
        this.actionName = actionName;
        this.method = method;
        this.args = args;
    }
    async retrieve() {
        var result = await global.window.fastui.apiHandler.execute(this.className, this.actionName, this.args, this.method);
        this.records = result;
        return true;
    }
}