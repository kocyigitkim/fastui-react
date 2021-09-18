import { FastApiClient } from "fastapi-express-client";
import { getApiHandler } from ".";
import { EventBuilder } from "./EventBuilder";

export class PermissionBuilder {
    constructor({ path, className, actionName }) {
        this.path = path || "/api";
        this.className = className || "permission";
        this.actionName = actionName || "check";
        this.inited = false;
    }
    init() {
        if (!this.inited) {
            this.inited = true;
            const apiHandler = getApiHandler();
            this.api = new FastApiClient(this.path, apiHandler.baseUri);
            if (apiHandler.corsEnabled) this.api.setCors();
            this.api.setSession(apiHandler.sessionController);
        }
    }
    /**
     * 
     * @param {String} className 
     * @param {String} actionName 
     * @returns {Boolean}
     */
    async check(className, actionName, recordId) {
        this.init();
        const apiHandler = getApiHandler();
        const result = await this.api.execute(this.className, this.actionName, {
            "path": `${apiHandler.basePath}/${className}/${actionName}`,
            "Id": recordId
        }, "post").catch(console.error);
        return result && result.success === true;
    }
    async checkset(set) {
        this.init();
        const apiHandler = getApiHandler();
        const result = await this.api.execute(this.className, this.actionName + "/set", set.map(item => {
            return {
                "path": `${apiHandler.basePath}/${item.className}/${item.actionName}`,
                "Id": item.recordId
            };
        }), "post").catch(console.error);
        return result;
    }
}