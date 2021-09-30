const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Route {
    constructor(builder, className, actionName, id) {
        this.builder = builder;
        this.className = className;
        this.actionName = actionName;
        this.id = id;
    }
    next() {
        try {
            return this.builder.routes[this.builder.routes.indexOf(this) + 1];
        } catch (err) {
            console.error(err);
        }
        return null;
    }
    prev() {
        try {
            return this.builder.routes[this.builder.routes.indexOf(this) - 1];
        } catch (err) {
            console.error(err);
        }
        return null;
    }
    /**
     * 
     * @param {Route} b 
     */
    check(b) {
        return this.className === b.className && this.actionName === b.actionName && this.id === b.id;
    }
}
export class RouteBuilder {
    constructor() {
        this.routes = [];
    }
    /**
     * 
     * @returns {RouteBuilder}
     */
    static location() {
        var r = new RouteBuilder();
        r.parse(window.location.pathname);
        return r;
    }
    parse(pathname) {
        try {
            var parts = pathname.split("/").map(p => p.trim()).filter(p => p.length > 0);
            while (parts.length > 0) {
                var className = parts[0] || "";
                var actionName = parts[1] || "list";
                var id = parts[2] || "";
                if (isNaN(parseInt(id)) && uuidPattern.test(id.toLowerCase()) === false) {
                    id = null;
                }
                var route = new Route(this, className, actionName, id);
                this.routes.push(route);
                parts.splice(0, Math.min(3, parts.length));
            }
        } catch (err) {
            console.error(err);
        }
    }
    build() {
        var pathname = [];
        for (var route of this.routes) {
            if (route.className) {
                pathname.push(route.className);
            }
            if (route.actionName) {
                pathname.push(route.actionName);
            }
            if (route.id && route.id.length > 0) {
                pathname.push(route.id);
            }
        }
        return "/" + pathname.join("/");
    }
    /**
     * 
     * @param {RouteBuilder} b 
     */
    check(b) {
        var l = this.routes.length === b.routes.length;
        var p = l === true ? this.routes.filter((p, i) => p.check(b.routes[i])).length : false;
        return p && l;
    }
    setAction(routePath, actionName, id = null) {
        var className = null;
        className = routePath.split('/').filter(p => p.length > 0).reverse()[0];
        var routecount = routePath.split("/").map(p => p.trim()).filter(p => p.length > 0).length;
        try {
            const r = this.routes[routecount - 1];
            r.className = className;
            r.actionName = actionName;
            r.id = id;
            this.routes[routecount - 1] = r;
        } catch (err) {
            this.routes.push({
                className: className,
                actionName: actionName,
                id: id
            });
            console.error(err);
        }
        return this;
    }
    getId(route) {
        try {
            const l = route.split('/').length;
            return this.routes[l - 1].id;
        } catch (err) {
            return null;
        }
    }
}
