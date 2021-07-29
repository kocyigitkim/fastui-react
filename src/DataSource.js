import FastState from 'faststate-react';
import { EventBuilder } from './EventBuilder';
export class IDataSource extends FastState {
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
        await this.onRetrieve.invoke(this, result);
        return true;
    }
}