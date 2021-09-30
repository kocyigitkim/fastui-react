import React, { Component } from 'react'
import { chooseOne, getApiHandler, getElevation, getPermissionBuilder, isPermissionCheckEnabled, redirectTo, translate } from '../utils';
import Styles from './styles/FastGrid.css'
import Loading from './Loading'
import { FastForm } from './Form'
import { v4 as uuid } from 'uuid'
import { DynoState } from 'faststate-react/states/DynoState';
import { LocalDataSource } from '../DataSource';
import AccessDenied from './AccessDenied'
import CustomRoute from './CustomRoute';
import { RouteBuilder } from '../RouteBuilder';
import { FastDialog } from './Dialog'
import toast from 'react-hot-toast';
export default class FastGrid extends Component {
    state = {
        page: 0,
        itemCount: 10,
        searchText: null,
        isMobile: false,
        loading: false,
        data: null,
        checkedList: [],
        mode: 'grid',
        orderColumn: null,
        orderState: false, //false=ascending, true=descending
        filters: {},
        editData: null,
        pagination: {
            page: 0,
            itemCount: 10,
            count: 0,
            pageCount: 0
        },
        accessGranted: true,
        grantedActions: [],
    };
    refreshTimerId = 0;
    extra = {};
    refreshListDelayed(delay) {
        clearTimeout(this.refreshTimerId);
        this.refreshTimerId = setTimeout(this.refreshList.bind(this), delay);
    }
    constructor(props) {
        super(props);
        this.state.mode = props.defaultMode || "grid";
        this.applyLocalFilter = this.applyLocalFilter.bind(this);
        this.isGranted = this.isGranted.bind(this);
    }

    saveConfig() {
        window.localStorage.setItem(this.__id, JSON.stringify({ itemCount: this.state.itemCount }));
    }
    componentDidMount() {
        const key = `fastgrid-${this.props.title}-${this.props.path}-${this.props.hash}`;
        this.__id = key;

        this.extra.retrievePath = `${this.props.path}/retrieve`;
        this.extra.createPath = `${this.props.path}/create`;
        this.extra.editPath = `${this.props.path}/edit`;
        this.extra.detailPath = `${this.props.path}/detail`;
        this.extra.deletePath = `${this.props.path}/delete`;
        this.extra.getPath = ((action) => (`${this.props.path}/${action}`)).bind(this);
        this.extra.execute = async (path, ...args) => {
            var parts = path.split("/");
            var className = parts[0];
            var actionName = parts[1];
            return await global.window.fastui.apiHandler.execute.call(global.window.fastui.apiHandler, className, actionName, ...args).catch(console.error);
        };

        var lastConfig = JSON.parse(window.localStorage.getItem(key)) || {};
        window.addEventListener("resize", this.onResize.bind(this));
        this.onResize.call(this);
        window.addEventListener("popstate", this.popstate);
        this.setState({ ...lastConfig, pagination: { page: 0, itemCount: lastConfig.itemCount || 10 } }, this.refreshList.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener("popstate", this.popstate);
    }
    componentDidUpdate() {
        this.saveConfig();
    }
    applyLocalFilter(data) {
        const orderColumn = this.state.orderColumn;
        const orderState = this.state.orderState;
        const showSearch = this.props.search;
        const customSearch = this.props.customSearch || this.defaultSearchMethod;

        if (!data) data = this.state.data || [];
        if (showSearch) {
            data = data.filter(customSearch.bind(this, this.state.searchText));
        }
        if (Object.keys(this.state.filters).length > 0) {
            const filters = this.state.filters;
            data = data.filter(row => {
                for (var k in filters) {
                    var v = filters[k];
                    if (v.length === 0) continue;

                    if (v.indexOf(row[k]) === -1) return false;
                }
                return true;
            });
        }
        if (orderColumn) {
            data = data.sort((a, b) => {
                var vA = a[orderColumn];//(a[orderColumn] || "").toString();
                var vB = b[orderColumn];//(b[orderColumn] || "").toString();
                var sign = vA > vB ? 1 : (vA < vB ? -1 : 0);
                return orderState ? (sign * -1) : sign;
            });
        }
        var isLocal = this.props.datasource instanceof LocalDataSource ? true : false;
        if (isLocal && this.state.page * this.state.itemCount > data.length) {
            this.setState({
                page: 0
            }, this.refreshList.bind(this));
        }

        var filteredData = isLocal ? data.slice(this.state.page * this.state.itemCount, Math.min(data.length, ((this.state.page + 1) * this.state.itemCount))) : data;

        this.setState({
            filtered: {
                filteredData,
                data
            }
        });
    }
    async retrieveData() {
        var datasource = this.props.datasource;
        const extraArgs = this.props.extraArgs;
        if (datasource && datasource.retrieve) {

            datasource.args = {
                ...datasource.args,
                ...extraArgs,
                pagination: {
                    page: this.state.page,
                    itemCount: this.state.itemCount
                },
                filter: this.state.filters,
                search: this.state.searchText,
                sort: {
                    column: this.state.orderColumn,
                    state: this.state.orderState
                }
            };
            await datasource.retrieve();
            var isAccessGranted = datasource.rawResult && datasource.rawResult.status === 403 ? false : true;
            var newPagination = (datasource.rawResult || {}).pagination;
            this.setState({
                data: [],
                accessGranted: isAccessGranted
            }, () => {
                this.setState({
                    data: datasource.records || [],
                    pagination: newPagination
                }, this.applyLocalFilter.bind(this, datasource.records || []));
            });
        }
        else {
            this.setState({
                data: this.props.data || []
            }, this.applyLocalFilter.bind(this, this.props.data || []));
        }
    }
    async refreshList() {
        this.setState({ loading: true, data: null, accessGranted: true });
        const actions = [];
        const actionMap = {};
        if (this.props.actions && Array.isArray(this.props.actions)) {
            for (var action of this.props.actions) {
                actions.push({
                    className: this.props.path,
                    actionName: action.action
                });
                actionMap[action] = actions.length - 1;
            }

        }
        if (this.props.multiActions && Array.isArray(this.props.multiActions)) {
            for (var action of this.props.multiActions) {
                actions.push({
                    className: this.props.path,
                    actionName: action.action
                });
                actionMap[action] = actions.length - 1;
            }
        }
        if (this.props.create) {
            actions.push({
                className: this.props.path,
                actionName: "create"
            });
            actionMap["props_create"] = actions.length - 1;
        }
        if (this.props.edit) {
            actions.push({
                className: this.props.path,
                actionName: "edit"
            });
            actionMap["props_edit"] = actions.length - 1;
        }
        if (this.props.delete) {
            actions.push({
                className: this.props.path,
                actionName: "delete"
            });
            actionMap["props_delete"] = actions.length - 1;
        }

        const actionResult = await getPermissionBuilder().checkset(actions);

        this.setState({
            grantedActions: actionResult && actionResult.filter(item => item.status === 200).map((item, index) => {
                return actions[index].actionName;
            })
        });

        await this.retrieveData.call(this);
        setTimeout(() => { this.setState({ loading: false }); }, 500);
    }
    isGranted(actionName) {
        if (!isPermissionCheckEnabled()) return true;

        return this.state.grantedActions && this.state.grantedActions.indexOf(actionName) > -1;
    }
    onResize() {

        var isMobile = window.innerWidth < 1000;
        if (this.state.isMobile !== isMobile) {
            this.setState({ isMobile });
        }
    }
    renderCheck(id, index) {
        const onChange = (() => {
            if (id === null) {
                if (this.state.checkedList.length > 0) {
                    this.setState({ checkedList: [] });
                }
                else {
                    this.setState({ checkedList: ["-1"] });
                }
            }
            else {
                var index = this.state.checkedList.indexOf(id);
                var isExist = Boolean(index > -1);
                if (isExist) {
                    var list = this.state.checkedList;
                    list.splice(index, 1);
                    this.setState({
                        checkedList: list
                    });
                }
                else {
                    if (this.state.checkedList[0] === '-1') {
                        const keySelector = this.keySelector.call(this);
                        this.setState({ checkedList: this.state.data.map(item => keySelector(item)).filter(item => item !== id) });
                    }
                    else {
                        this.setState({
                            checkedList: [...this.state.checkedList, id]
                        });
                    }
                }
            }
        }).bind(this);
        const key = "cck" + index;//"cck_" + id + (new Date()).valueOf() + Math.random().toString();
        const isChecked = ((id === null ? (this.state.checkedList.length > 0) : (this.state.checkedList[0] === '-1' || this.state.checkedList.indexOf(id) > -1)));
        const isIndeterminate = (this.state.checkedList[0] !== '-1' && this.state.checkedList.length > 0 && this.state.checkedList.length !== (this.state.data || []).length) && id === null;
        const component = <div className="custom-control custom-checkbox" style={{ position: 'relative', top: -12 }}>
            <input ref={(r) => {
                if (r) r.indeterminate = isIndeterminate;
            }} type="checkbox" checked={isChecked} onChange={onChange} className="custom-control-input" id={key} />
            <label className={`custom-control-label ${Styles['custom-control-label']}`} htmlFor={key} />
        </div>;
        if (id === null) return [<th>{component}</th>, isChecked];
        else return [<td>{component}</td>, isChecked, onChange];
    }
    keySelector() {
        return this.props.keySelector || ((data) => data.id || data.Id)
    }
    setLoading(v) {
        this.setState({
            loading: v
        });
    }
    setMode(v) {
        if (v !== this.state.mode) {
            var subpath = {
                'grid': 'list',
                'create': 'create',
                'edit': 'edit'
            }[v];
            if (this.props.route) {
                redirectTo("/" + (this.props.route || this.props.path) + "/" + subpath);
            }
        }

        this.setState({
            mode: v
        }, v === 'grid' ? this.refreshList.bind(this) : null);
    }
    resetEdit() {
        this.setState({
            editData: null
        });
    }

    render() {
        const titlePlural = translate(this.props.titlePlural);
        const isRouteEnabled = Boolean(this.props.route);
        const title = translate(this.props.title);
        const pageSizes = this.props.pageSizes || [10, 20, 50, 100];
        var data = (this.state.filtered && this.state.filtered.data) || [];
        var rawData = this.state.data || [];
        var filteredData = (this.state.filtered && this.state.filtered.filteredData) || [];
        const routePath = (this.props.route);
        const showSearch = this.props.search;
        const customSearch = this.props.customSearch || this.defaultSearchMethod;
        const isMobile = this.state.isMobile;
        const showCreate = this.props.create;
        const loading = this.state.loading;
        const showFilter = this.props.filter;
        var actions = this.props.actions;
        const orderColumn = this.state.orderColumn;
        const orderState = this.state.orderState;
        const showSort = this.props.sort;
        const apiPath = this.props.path;
        const idSelector = this.props.idSelector || "Id";
        const extraArgs = this.props.extraArgs;
        const setFilter = (fieldName, filter) => { this.setState({ filters: { ...this.state.filters, [fieldName]: filter } }, this.refreshList.bind(this)); };
        const resetFilter = (fieldName) => {
            var filters = this.state.filters;
            delete filters[fieldName];
            this.setState({ filters: filters }, this.refreshList.bind(this));
        }
        const setOrder = (columnName) => {
            if (!showSort) return;

            this.setState({
                orderColumn: columnName,
                orderState: this.state.orderColumn === columnName ? (!this.state.orderState) : false
            }, this.refreshList.bind(this));
        };
        if (this.props.edit) {
            var editAction = (props) => (<FastForm.Edit onClick={() => {
                if (isRouteEnabled) {
                    redirectTo(RouteBuilder.location().setAction(this.props.route, "edit", props.data[idSelector]).build());
                }
                else {
                    this.setState({ mode: 'edit', editData: { [idSelector]: props.data[idSelector] } });
                }
            }} />);
            editAction.action = "edit";
            actions = [...(actions ?? []), editAction];
        }
        if (this.props.delete) {
            var deleteAction = (props) => (<FastForm.Delete onClick={() => {
                const deleteId = props.data[idSelector];

                FastDialog.showYesNo({
                    title: translate('FORM.DELETE.TITLE'),
                    size: 'md',
                    message: translate('FORM.DELETE.CONTENT'),
                    onYes: async () => {
                        var r = await getApiHandler().execute(this.props.path, "delete", { Id: deleteId }, "post");
                        if (r && r.success) {
                            toast.success(translate('FORM.SUCCESS'));
                            this.refreshList.call(this);
                        } else {
                            toast.error(translate(r.message || 'FORM.SAVE.ERROR'));
                        }
                    }
                });
            }} />);
            deleteAction.action = "delete";
            actions = [...(actions ?? []), deleteAction];
        }
        if (actions) {
            actions = actions.filter(p => {
                if (!p.action) return true;

                if (p.action && this.isGranted(p.action)) return true;
                return false;
            });
        }
        var multiActions = this.props.multiActions;
        if (multiActions) {
            multiActions = multiActions.filter(p => {
                if (!p.action) return true;

                if (p.action && this.isGranted(p.action)) return true;
                return false;
            });
        }
        const keySelector = this.keySelector.call(this);
        const checkboxEnabled = this.props.checked !== null && this.props.checked !== undefined ? Boolean(this.props.checked) : false;
        const _children = (this.props && this.props.children && this.props.children.length > 0 ? this.props.children : [this.props.children]).filter((child) => {
            if (!child) return false;
            if ((child.props && child.props.hide || "").indexOf("grid") > -1) {
                return false;
            }
            return true;
        });
        const checkedItemCount = this.state.checkedList && this.state.checkedList[0] === '-1' ? (rawData.length) : (this.state.checkedList || []).length;

        const elevation = chooseOne(this.props.elevation, 5);
        return <div>
            <CustomRoute getLocation={() => this.state.location_1} setLocation={(l) => this.setState({ location_1: l })} override={!isRouteEnabled && this.state.mode === 'create'} key={"cr-1"} exact path={routePath} action="create" component={<FastGridNewForm key="dt-create" route={routePath} requestMapper={this.props.requestMapper} extraArgs={extraArgs} idSelector={idSelector} path={this.props.path} resetEdit={this.resetEdit.bind(this)} {...this.props} api={this.extra} mode={"create"} edit={this.props.edit} create={this.props.create} title={title} setMode={this.setMode.bind(this)} children={_children} datagrid={this} refresh={this.refreshList.bind(this)} setLoading={this.setLoading.bind(this)} />} />
            <CustomRoute getLocation={() => this.state.location_2} setLocation={(l) => this.setState({ location_2: l })} override={!isRouteEnabled && this.state.mode === 'edit'} key={"cr-2"} exact path={routePath} action="edit" component={<FastGridNewForm key="dt-edit" route={routePath} requestMapper={this.props.requestMapper} extraArgs={extraArgs} idSelector={idSelector} path={this.props.path} resetEdit={this.resetEdit.bind(this)} editData={this.state.mode === 'edit' && (this.state.editData || { Id: RouteBuilder.location().getId(this.route) })} location={this.state.location_2} {...this.props} api={this.extra} mode={"edit"} edit={this.props.edit} create={this.props.create} title={title} setMode={this.setMode.bind(this)} children={_children} datagrid={this} refresh={this.refreshList.bind(this)} setLoading={this.setLoading.bind(this)} />} />
            <CustomRoute getLocation={() => this.state.location_3} setLocation={(l) => this.setState({ location_3: l })} override={!isRouteEnabled && this.state.mode === 'grid'} key={"cr-3"} exact path={routePath} action="list" component={
                <div key="dt-list" className="card" style={{ marginBottom: 10, borderRadius: 10, boxShadow: getElevation(elevation, chooseOne(this.props.elevationColor, '#000')) }}>
                    <AccessDenied show={this.state.accessGranted === false} />
                    <Loading show={loading} />
                    <div className="card-header" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <div style={this.state.accessGranted === false ? {
                            position: 'relative',
                            zIndex: 11,
                            color: 'white !important'
                        } : null}>
                            <div className="row" style={{ margin: 0, marginBottom: 10 }}>
                                <div className="col"> <h4 className="card-title">{titlePlural || title}</h4></div>
                                <div><i onClick={this.refreshList.bind(this)} className="bi bi-arrow-clockwise btn btn-outline-dark" style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}></i></div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                            <div style={{ flex: 1, marginBottom: isMobile ? 10 : 0 }}>
                                {showSearch && <FastGridSearchBox block style={{ maxWidth: isMobile ? '100%' : 300 }} data={data} filteredData={filteredData} value={this.state.searchText} setValue={(v) => { this.setState({ searchText: v }, this.refreshListDelayed.bind(this, 400)) }}></FastGridSearchBox>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {showCreate && this.isGranted("create") && <FastGridCreate {...this.props} path={apiPath} route={routePath} setMode={this.setMode.bind(this)} />}
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        {checkedItemCount > 0 && <div className="alert alert-dark mt-3 p-4" style={{ borderRadius: 6, boxShadow: '0px 3px 10px rgba(0,0,0,0.15)' }}>
                            <div className="row">
                                <div className="col" dangerouslySetInnerHTML={{ __html: translate("DATAGRID.SELECTED.NRECORD").replace("%n%", checkedItemCount) }} ></div>
                                {multiActions && <div className="mr-2 p-1" style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10 }}>{
                                    multiActions.map((Item, index) => <div key={"kk" + index} style={{ margin: 2, display: 'inline-block' }}><Item datagrid={this} idField={idSelector} ids={
                                        this.state.checkedList[0] === '-1' ? rawData.map((item) => item[idSelector]) : this.state.checkedList
                                    } data={(this.state.data || [])}></Item></div>)
                                }</div>}
                            </div>
                        </div>}

                        {isMobile ? (<div>
                            {filteredData.map((rowItem, index) => {
                                const dataId = keySelector(rowItem);
                                const checkBox = checkboxEnabled && (this.renderCheck.call(this, dataId));
                                const isChecked = checkBox && checkBox[1];
                                return <div className={isChecked && 'table-primary'} style={{ padding: 10, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                    {checkBox && <div style={{ marginBottom: 10 }}>{checkBox[0]}</div>}
                                    {React.Children.map(_children, child => {
                                        if (React.isValidElement(child)) {
                                            return React.cloneElement(child, { data: rowItem, value: rowItem[child.props.name], datagrid: this });
                                        }
                                        return child;
                                    }).map(item => <div className="row">
                                        <div className="col-6 font-weight-bold"> {translate(item.props.title || items.props.name)}</div>
                                        <div className="col-6 datagrid-cell"> {item}</div>
                                    </div>)}
                                    {
                                        actions && <div className="row col-12 datagrid-cell" style={{ justifyContent: 'flex-end' }}>
                                            <label className="font-weight-bold">{translate("DATAGRID.ACTIONS")}</label>
                                            <hr />
                                            {actions.map((Item, index) => <div style={{ display: 'inline-block', margin: 2 }}><Item key={"kk" + index} datagrid={this} idField={idSelector} ids={[dataId]} id={dataId} data={rowItem}></Item></div>)}
                                        </div>
                                    }
                                </div>;
                            })}
                        </div>) : (<div className="table-responsive" style={{ minHeight: 200, overflow: 'visible' }}>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        {checkboxEnabled && (this.renderCheck.call(this, null)[0])}
                                        {_children.map((col, index) => {
                                            const { title, name, gridTitle } = col.props;
                                            const translated = translate(gridTitle || title || name);
                                            return <th key={"th" + index} style={{ userSelect: 'none', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex' }}>
                                                    {orderColumn === name && (orderState ? (<i style={{ color: 'black', marginRight: 3 }} className="bi bi-sort-alpha-up"></i>) : (<i style={{ color: 'black', marginRight: 3 }} className="bi bi-sort-alpha-down"></i>))}
                                                    <div onClick={setOrder.bind(this, name)} style={{ flex: 1 }}>{translated}</div>
                                                    {showFilter && col.props.filter !== false && (
                                                        <RenderFilter setFilter={setFilter} resetFilter={resetFilter} key={"kk" + index} isFiltered={Boolean(this.state.filters[col.props.name])} col={col} data={rawData}></RenderFilter>
                                                    )}
                                                </div>
                                            </th>;
                                        })}
                                        {actions && <th>{translate("DATAGRID.ACTIONS")}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((rowItem, index) => {
                                        const dataId = keySelector(rowItem);
                                        const checkBox = checkboxEnabled && (this.renderCheck.call(this, dataId, index));
                                        const isChecked = checkBox && checkBox[1];
                                        return <tr key={"tr" + index} className={isChecked && 'table-primary'} >
                                            {checkBox && checkBox[0]}
                                            {React.Children.map(_children, child => {
                                                if (React.isValidElement(child)) {
                                                    return React.cloneElement(child, { data: rowItem, value: rowItem[child.props.name], datagrid: this });
                                                }
                                                return child;
                                            }).map((item, itemIndex) => <td key={itemIndex}>{item}</td>)}
                                            {
                                                actions && <td>{actions.map((Item, actionIndex) => <div key={actionIndex} style={{ display: 'inline-block', margin: 2 }}><Item datagrid={this} idField={idSelector} ids={[dataId]} id={dataId} data={rowItem}></Item></div>)}</td>
                                            }
                                        </tr>;
                                    })}
                                </tbody>

                            </table>
                        </div>)}

                        <div>
                            <div style={{ float: 'left' }}>
                                <label className="font-weight-bold font-size-xs text-muted">{translate("DATAGRID.STATUS.NRECORD").replace("%n%", this.state.pagination ? this.state.pagination.count : rawData.length)}</label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{ marginRight: 3 }}>
                                    <FastPageSizeChanger pageSizes={pageSizes} pageSize={this.state.itemCount} setPageSize={((p) => {
                                        var prevPageCount = Math.ceil(data.length / (this.state.itemCount * 1.0));
                                        var newPageCount = Math.ceil(data.length / (p * 1.0));
                                        var newPage = this.state.page / (prevPageCount * 1.0) * newPageCount;
                                        if (newPage + 1 > newPageCount) newPage = newPageCount - 1;
                                        if (newPage < 0) newPage = 0;
                                        newPage = Math.floor(newPage);
                                        this.setState({ itemCount: p, page: newPage }, this.refreshList.bind(this));
                                    })} />
                                </div>
                                <div style={{ marginRight: 3 }}>
                                    <FastPagination pagination={this.state.pagination} max={data.length} itemCount={this.state.itemCount} page={this.state.page} setPage={(p) => { this.setState({ page: p }, this.refreshList.bind(this)); }}></FastPagination>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            } />
        </div>;
    }

    defaultSearchMethod(search, row) {
        if (!search)
            return true;

        search = search.toLowerCase();

        for (var k in row) {
            var v = (row[k] || "").toString().toLowerCase();
            if (v.indexOf(search) > -1) {
                return true;
            }
        }
        return false;
    }
}

class FastPagination extends Component {

    render() {
        const pagination = this.props.pagination || {};
        const page = pagination.page || this.props.page;
        const itemCount = pagination.itemCount || this.props.itemCount;
        const count = pagination.count || this.props.max;
        const setPage = this.props.setPage;
        const pageCount = pagination.pageCount || Math.ceil(count / (itemCount * 1.0));
        var items = [];
        var stepCount = Math.min(6, pageCount);
        var startIndex = Math.round(Math.max(0, (page - stepCount / 2.0)));
        var endIndex = Math.min(pageCount, startIndex + stepCount);

        if (startIndex > 0) items.push(["<<", 0]);
        if (page > 1 && stepCount === 6) {
            items.push(["...", Math.max(0, startIndex)]);
        }
        for (var i = 0; i < stepCount; i++) {
            if (i + startIndex + 1 > pageCount) break;
            items.push([(i + startIndex + 1).toString(), (startIndex + i)]);
        }
        if (endIndex < pageCount) {
            items.push(["...", Math.min(pageCount, endIndex)]);
        }
        if (page + 1 < pageCount) items.push([">>", pageCount - 1]);
        return <ul className="pagination" style={{ margin: 0 }}>{items.map(item => {
            return <li key={"k" + item} className={`page-item ${item[1] === page ? 'active' : null}`}>
                <button type="button" style={{ padding: 10 }} onClick={() => { setPage(item[1]) }} className="page-link" style={{ boxShadow: getElevation(item[1] === page ? 2 : 0) }}>{item[0]}</button>
            </li>;
        })}</ul>;
    }
}

class FastPageSizeChanger extends Component {
    id = null;
    constructor(props) {
        super(props);
        this.id = (new Date().valueOf() + "_" + Math.random().toString()).replace(".", "");
    }
    render() {
        const { pageSize, pageSizes, setPageSize } = this.props;
        const toggleMenu = () => {
            var menu = window.document.querySelector(`div.dropdown-menu[aria-labelledby='${this.id}']`);
            if (menu.classList.contains("show")) {
                menu.classList.remove("show");
            }
            else {
                menu.classList.add("show");
            }
        };
        return <div className="dropdown dropup">
            <button onClick={toggleMenu} className="btn btn-secondary dropdown-toggle" type="button" id={this.id} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {pageSize}
            </button>
            <div className="dropdown-menu" aria-labelledby={this.id}>
                {pageSizes.map((item, i) => {
                    return <button key={"k" + i} onClick={() => { setPageSize(item); toggleMenu(); }} className="dropdown-item" href="#">{item}</button>;
                })}
            </div>
        </div>;
    }
}

class FastGridSearchBox extends Component {
    render() {
        const { data, filteredData, style, block } = this.props;
        var found = (data || []).length;
        var foundTranslated = translate("DATAGRID.SEARCH.FOUND");
        var searchTitle = translate("DATAGRID.SEARCH.TITLE");
        return <div className="input-group" style={{ display: block ? 'flex' : 'inline-flex', flex: 1 }}>
            <div className="input-group-prepend" style={{ display: 'block' }}>
                <span className="input-group-text" style={{ height: '100%' }}><i className="bi bi-search"></i></span>
            </div>
            <input placeholder={searchTitle} style={{ flex: 1, ...style, height: 44 }} className="form-control" type="text" value={this.props.value} onChange={(evt) => { this.props.setValue(evt.target.value) }} />
            {(this.props.value || "").trim().length > 0 && <div class="input-group-append" style={{ display: 'block' }}>
                <span class="input-group-text" style={{ cursor: 'pointer', padding: '0px 5px', height: '100%' }} onClick={() => {
                    this.props.setValue("");
                }}><i className="bi bi-x text-dark" style={{ fontSize: '1.5rem' }}></i></span>
            </div>}
            {found !== null && found !== undefined && (this.props.value || "").length > 0 ? (
                <div>
                    <label className="text-muted font-weight-bold font-italic font-size-xs p-1 pt-3" style={{ fontSize: '0.7rem' }}>{foundTranslated.replace("%n%", found)}</label>
                </div>
            ) : null
            }
        </div>
    }
}

class FastGridCreate extends Component {
    render() {

        return <div>
            <button type="button" onClick={() => {
                if (this.props.route) {
                    redirectTo(RouteBuilder.location().setAction(this.props.route, "create").build());
                }
                else {
                    this.props.setMode('create');
                }
            }} className="btn btn-primary"><i className="bi bi-plus"></i> {translate("DATAGRID.ACTION.CREATE")}</button>
        </div>
    }
}

class FastGridNewForm extends Component {
    _state = new DynoState();
    state = {
        loading: false
    }
    lastEditId = null;
    constructor(props) {
        super(props);
        this.state = { ...this.state, ...props.editData };
    }
    async componentDidMount() {
        if (this.props.datagrid && this.props.mode === 'edit') {
            const api = getApiHandler();
            this.setState({ loading: true });
            var response = await api.execute(this.props.path, "detail", { ...this.props.extraArgs, [this.props.idSelector]: this.lastEditId }, "post");
            setTimeout(() => { this.setState({ loading: false }); }, 500);
            if (response) {
                if (response.success === true) {
                    this._state.setAll(response.data[0]);
                }
            }
        }
    }
    componentDidUpdate() {
        var newId = null;
        if (this.props.editData) {
            newId = this.props.editData[this.props.idSelector || "Id"];
        }
        if (!newId && this.props.location && this.props.location.args && this.props.location.args.id) {
            newId = this.props.location.args.id;
        }
        if (!newId) {
            newId = RouteBuilder.location().getId(this.props.route);
        }
        if (this.lastEditId !== newId) {
            this.lastEditId = newId;
            this.componentDidMount.call(this);
        }
    }
    submit(ctx) {
        if (ctx.action === 'cancel') {
            if (this.props.route) {
                redirectTo(RouteBuilder.location().setAction(this.props.route, "list").build());
            }
            else {
                this.props.setMode('grid');
            }
        }
        else {
            ctx.submit();
        }
    }
    getState() {
        return this._state;
    }
    getFormField(name) {
        return this.getState().value(null, name);
    }
    setFormField(name, value) {
        this.getState().value(null, name).writeUpdate(value);
    }
    getFieldProps(name, onChange) {
        const fieldValueRef = this._state.value(null, name);
        return {
            datagrid: this.props.datagrid, name: name, value: fieldValueRef, onChange: (v) => {
                if (v !== null && v !== undefined) {
                    if (v.checked) v = v.checked;
                    v = v.target ? v.target.value : v;
                }
                if (onChange) onChange(v, name);
            }
        };
    }
    onSave(response) {
        if (response && response.success === true) {
            this.props.setMode("grid");
        }
    }
    render() {
        const isEditMode = this.props.mode === 'edit';
        var Form = (isEditMode ? this.props.edit : this.props.create);
        if (Form === true || Form === false) Form = null;

        return <div>
            <FastForm requestMapper={this.props.requestMapper} extraArgs={this.props.extraArgs} state={this._state} loading={this.state.loading} editId={this.props.editData && this.props.editData[this.props.idSelector || "Id"]} onSave={this.onSave.bind(this)} path={this.props.path} title={translate(`DATAGRID.${isEditMode ? 'EDIT' : 'NEW'}.TITLE`).replace("%str%", this.props.title)} headerActions={[FastForm.Cancel]} actions={[FastForm.Save]} submit={this.submit.bind(this)}>
                {(formProps) => {
                    var buildedFormComponent = ((Form === null || Form === undefined) ? React.Children.map(this.props.children, child => {
                        var hideParts = (child.props.hide || "").split(",");
                        if (hideParts.indexOf(this.props.mode) > -1) return <div></div>;

                        if (React.isValidElement(child)) {
                            const fieldValueRef = this._state.value(null, child.props.name);
                            return React.cloneElement(child, {
                                datagrid: this.props.datagrid, value: fieldValueRef, onChange: child.props.onChange
                            });
                        }
                        return child;
                    }) : ([<Form {...this.props} getFieldProps={this.getFieldProps.bind(this)} getFormField={this.getFormField.bind(this)} setFormField={this.setFormField.bind(this)} />]));
                    return buildedFormComponent;
                }}
            </FastForm>
        </div>
    }
}



class RenderFilter extends Component {
    state = {
        show: false,
        selectedItems: [],
        searchText: null
    }
    id = uuid();
    defaultSearchMethod(search, row) {
        if (!search)
            return true;
        search = search.toLowerCase();
        return (row || "").toString().toLowerCase().indexOf(search) > -1;
    }
    render() {
        var data = this.props.data || [];
        const col = this.props.col;
        const isPopoverOpen = this.state.show;
        const setIsPopover = ((v) => { this.setState({ show: v }) }).bind(this);
        const setIsPopoverToggle = ((v) => { this.setState({ show: !this.state.show }) }).bind(this);
        const setSearchText = (v) => { this.setState({ searchText: v }) }
        const setSelectedItem = (v) => {
            var i = this.state.selectedItems.indexOf(v);
            if (i > -1) {
                var l = this.state.selectedItems;
                l.splice(i, 1);
                this.setState({ selectedItems: l });
            }
            else {
                this.setState({ selectedItems: [...this.state.selectedItems, v] });
            }
        };

        var filterList = data.map(item => item[col.props.name]).filter(onlyUnique);
        var rawFilterList = filterList;
        if (this.state.searchText && this.state.searchText.length > 0) {
            filterList = filterList.filter(this.defaultSearchMethod.bind(this, this.state.searchText));
        }

        const selectedCount = this.state.selectedItems.length;
        const filterCount = rawFilterList.length;
        const isFiltered = this.props.isFiltered && selectedCount > 0;


        return <div style={{ display: 'inline-block' }}>


            <div className={`dropdown ${isPopoverOpen ? 'show' : ''}`}>
                <button type="button" data-toggle="dropdown" onClick={setIsPopoverToggle.bind(this)} style={{ borderRadius: 0, marginLeft: 2, userSelect: 'none', cursor: 'pointer', backgroundColor: isFiltered ? 'rgba(0,0,0,0.1)' : 'transparent', textShadow: isFiltered ? '0px 0px 1px black' : 'none', borderRadius: '100%', width: 24, height: 24, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                    <i className="bi bi-filter" style={{ color: 'black' }}></i>
                </button>
                <div className={`dropdown-menu ${isPopoverOpen ? 'show' : ''}`} aria-labelledby={this.id} style={{ padding: 5, minWidth: 300 }}>
                    <FastGridSearchBox data={filterList} block style={{ maxWidth: '100%', width: '100%' }} value={this.state.searchText} setValue={setSearchText} />
                    {selectedCount > 0 && <div className="alert alert-dark mt-3 p-4" style={{ borderRadius: 6, boxShadow: '0px 3px 10px rgba(0,0,0,0.15)' }}>
                        <div className="row">
                            <div className="col" dangerouslySetInnerHTML={{ __html: translate("DATAGRID.FILTER.SELECTED.NRECORD").replace("%n%", selectedCount).replace("%m%", filterCount) }} ></div>
                        </div>
                    </div>}
                    <div style={{ marginTop: 10, maxHeight: 250, height: 250, overflowY: 'scroll', padding: 3, overflowX: 'hidden' }}>
                        <div className="list-group">
                            {filterList.filter((item, i) => i < 5000).map((item, index) => <button type="button" className="list-group-item list-group-item-action" style={{ margin: 0, display: 'flex', padding: 5 }}>

                                <div className="custom-control custom-checkbox" style={{ position: 'relative' }}>
                                    <input type="checkbox" checked={this.state.selectedItems.indexOf(item) > -1} onChange={(evt) => {
                                        setSelectedItem(item);
                                    }} className="custom-control-input" id={"kkc" + item + this.id + index} />
                                    <label className={`custom-control-label ${Styles['custom-control-label']}`} htmlFor={"kkc" + item + this.id + index} />
                                </div>

                                <label style={{ padding: 10 }}>{item}</label>
                            </button>)}
                            {filterList.length >= 5000 && <div style={{ fontWeight: 'bold', color: 'black', padding: 10 }}>...</div>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginTop: 5 }}>
                        <button type="button" onClick={() => {
                            this.props.setFilter(col.props.name, this.state.selectedItems);
                            this.setState({ show: false });
                        }} className="btn btn-primary" style={{ flex: 1, margin: 3 }}>{translate("DATAGRID.FILTER.APPLY")}</button>
                        <button type="button" onClick={() => {
                            this.props.resetFilter(col.props.name);
                            this.setState({ show: false, selectedItems: [] });
                        }} className="btn btn-outline-dark" style={{ flex: 1, margin: 3 }}>{translate("DATAGRID.FILTER.RESET")}</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
