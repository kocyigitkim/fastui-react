import { EventBuilder } from "./EventBuilder";

export class PermissionBuilder {
    constructor(){
        this.permissions = [];
        this.role = null;
        this.isRetrieved = false;
        this.onRetrieve = new EventBuilder();
    }
    async retrieve(){
        this.isRetrieved = true;
        await this.onRetrieve.invoke(this, null);
        return false;
    }
    /**
     * 
     * @param {String} className 
     * @param {String} actionName 
     * @returns {Boolean}
     */
    async check(className, actionName){
        if(!this.isRetrieved) await this.retrieve();
        if(this.isRetrieved && this.permissions.length === 0 && this.role === null) return true;

        var key = `${this.role}.${className}.${actionName}`;
        var granted = this.permissions.indexOf(key)>-1;
        return Boolean(granted);
    }
}