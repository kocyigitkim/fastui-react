import React, { Component, Fragment } from 'react'
import { chooseOne, getElevation, translate } from '../utils';
import Styles from './styles/FastGrid.css'
import Loading from './Loading'
import { FastForm } from './Form'
import { v4 as uuid } from 'uuid'
import color from 'color'

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
        filters: [],
        editData: null
    };
    extra = {};
    constructor(props) {
        super(props);
        this.state.mode = props.defaultMode || "grid";
    }
    saveConfig() {
        window.localStorage.setItem(this.__id, JSON.stringify({ itemCount: this.state.itemCount }));
    }
    componentDidMount() {
        const key = `fastgrid-${this.props.title}-${this.props.class}-${this.props.hash}`;
        this.__id = key;

        this.extra.retrievePath = `${this.props.class}/retrieve`;
        this.extra.createPath = `${this.props.class}/create`;
        this.extra.editPath = `${this.props.class}/edit`;
        this.extra.deletePath = `${this.props.class}/delete`;
        this.extra.getPath = ((action) => (`${this.props.class}/${action}`)).bind(this);
        this.extra.execute = async (path, ...args) => {
            var parts = path.split("/");
            var className = parts[0];
            var actionName = parts[1];
            return await global.window.fastui.apiHandler.execute.bind(global.window.fastui.apiHandler, className, actionName, ...args).catch(console.error);
        };

        var lastConfig = JSON.parse(window.localStorage.getItem(key));
        this.setState(lastConfig);
        window.addEventListener("resize", this.onResize.bind(this));
        this.onResize.call(this);
        this.refreshList.call(this);
    }
    componentDidUpdate() {
        this.saveConfig();
    }
    async retrieveData() {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.setState({
            data: this.props.data || []
        });
    }
    async refreshList() {
        this.setState({ loading: true, data: null });
        await this.retrieveData.call(this);
        this.setState({ loading: false });
    }
    onResize() {

        var isMobile = window.innerWidth < 1000;
        if (this.state.isMobile !== isMobile) {
            this.setState({ isMobile });
        }
    }
    renderCheck(id) {
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
        const key = "cck_" + id + (new Date()).valueOf() + Math.random().toString();
        const isChecked = ((id === null ? (this.state.checkedList.length > 0) : (this.state.checkedList[0] === '-1' || this.state.checkedList.indexOf(id) > -1)));
        const isIndeterminate = (this.state.checkedList[0] !== '-1' && this.state.checkedList.length > 0 && this.state.checkedList.length !== (this.state.data || []).length) && id === null;
        const component = <div className="custom-control custom-checkbox" style={{ position: 'relative', top: -12 }}>
            <input ref={(r) => {
                if (r) r.indeterminate = isIndeterminate;
            }} type="checkbox" checked={isChecked} onChange={onChange} className="custom-control-input" id={key} />
            <label className={`custom-control-label ${Styles['custom-control-label']}`} htmlFor={key} />
        </div>;
        if (id === null) return [<th>{component}</th>, isChecked];
        else return [<td>{component}</td>, isChecked];
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
        this.setState({
            mode: v
        });
    }
    resetEdit() {
        this.setState({
            editData: null
        });
    }
    render() {
        const title = translate(this.props.title);
        const pageSizes = this.props.pageSizes || [10, 20, 50, 100];
        var data = this.state.data || [];
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
        const setOrder = (columnName) => {
            if (!showSort) return;

            this.setState({
                orderColumn: columnName,
                orderState: this.state.orderColumn === columnName ? (!this.state.orderState) : false
            });
        };
        if (this.props.edit) {
            actions = [...(actions ?? []), (props) => (<FastForm.Edit onClick={() => {
                this.setState({ mode: 'edit', editData: props.data });
            }} />)];
        }
        if (this.props.delete) {
            actions = [...(actions ?? []), (props) => (<FastForm.Delete />)];
        }
        const multiActions = this.props.multiActions;
        const keySelector = this.keySelector.call(this);
        const checkboxEnabled = this.props.checked !== null && this.props.checked !== undefined ? Boolean(this.props.checked) : false;
        const rawData = data;
        if (showSearch) {
            data = data.filter(customSearch.bind(this, this.state.searchText));
        }
        if (orderColumn) {
            data = data.sort((a, b) => {
                var vA = a[orderColumn];//(a[orderColumn] || "").toString();
                var vB = b[orderColumn];//(b[orderColumn] || "").toString();
                var sign = vA > vB ? 1 : (vA < vB ? -1 : 0);
                return orderState ? (sign * -1) : sign;
            });
        }
        if (this.state.page * this.state.itemCount > data.length) {
            this.setState({
                page: 0
            });
        }
        var filteredData = data.slice(this.state.page * this.state.itemCount, Math.min(data.length, ((this.state.page + 1) * this.state.itemCount)));
        const _children = (this.props && this.props.children && this.props.children.length > 0 ? this.props.children : [this.props.children]).filter((child) => {
            if (!child) return false;
            if ((child.props && child.props.hide || "").indexOf("grid") > -1) {
                return false;
            }
            return true;
        });
        const checkedItemCount = this.state.checkedList[0] === '-1' ? (rawData.length) : this.state.checkedList.length;

        if (this.state.mode === "new" || this.state.mode === "edit") {
            return <FastGridNewForm resetEdit={this.resetEdit.bind(this)} editData={this.state.mode === 'edit' && this.state.editData} {...this.props} api={this.extra} mode={this.state.mode} edit={this.props.edit} create={this.props.create} title={title} setMode={this.setMode.bind(this)} children={_children} datagrid={this} refresh={this.refreshList.bind(this)} setLoading={this.setLoading.bind(this)} />;
        }

        const elevation = chooseOne(this.props.elevation, 5);
        if (isMobile) {
            //      return <div>mobile view</div>;
        }
        return (
            <div className="card" style={{ marginBottom: 10, borderRadius: 10, boxShadow: getElevation(elevation, chooseOne(this.props.elevationColor, '#000')) }}>
                <Loading show={loading} />
                <div className="card-header" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <div>
                        <h4 className="card-title">{title}</h4>
                    </div>

                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1 }}>
                            {showSearch && <FastGridSearchBox block style={{ maxWidth: 300 }} data={data} filteredData={filteredData} value={this.state.searchText} setValue={(v) => { this.setState({ searchText: v }) }}></FastGridSearchBox>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {showCreate && <FastGridCreate {...this.props} setMode={this.setMode.bind(this)} />}
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {checkedItemCount > 0 && <div className="alert alert-dark mt-3 p-4" style={{ borderRadius: 6, boxShadow: '0px 3px 10px rgba(0,0,0,0.15)' }}>
                        <div className="row">
                            <div className="col" dangerouslySetInnerHTML={{ __html: translate("DATAGRID.SELECTED.NRECORD").replace("%n%", checkedItemCount) }} ></div>
                            {multiActions && <div className="mr-2 p-1" style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10 }}>{
                                multiActions.map((Item, index) => <div key={"kk" + index} style={{ margin: 2, display: 'inline-block' }}><Item datagrid={this} ids={this.state.checkedList} data={(this.state.data || [])}></Item></div>)
                            }</div>}
                        </div>
                    </div>}
                    <div className="table-responsive" style={{ minHeight: 200, overflow: 'visible' }}>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    {checkboxEnabled && (this.renderCheck.call(this, null)[0])}
                                    {_children.map((col, index) => {
                                        const { title, name, gridTitle } = col.props;
                                        const translated = translate(gridTitle || title || name);
                                        return <th style={{ userSelect: 'none', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex' }}>
                                                {orderColumn === name && (orderState ? (<i style={{ color: 'black', marginRight: 3 }} className="bi bi-sort-alpha-up"></i>) : (<i style={{ color: 'black', marginRight: 3 }} className="bi bi-sort-alpha-down"></i>))}
                                                <div onClick={setOrder.bind(this, name)} style={{ flex: 1 }}>{translated}</div>
                                                {showFilter && col.props.filter !== false && (
                                                    <RenderFilter key={"kk" + index} col={col} data={data}></RenderFilter>
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
                                    const checkBox = checkboxEnabled && (this.renderCheck.call(this, dataId));
                                    const isChecked = checkBox && checkBox[1];
                                    return <tr className={isChecked && 'table-primary'}>
                                        {checkBox && checkBox[0]}
                                        {React.Children.map(_children, child => {
                                            if (React.isValidElement(child)) {
                                                return React.cloneElement(child, { data: rowItem, value: rowItem[child.props.name], datagrid: this });
                                            }
                                            return child;
                                        }).map(item => <td>{item}</td>)}
                                        {
                                            actions && <td>{actions.map((Item, index) => <div style={{ display: 'inline-block', margin: 2 }}><Item key={"kk" + index} datagrid={this} id={dataId} data={rowItem}></Item></div>)}</td>
                                        }
                                    </tr>;
                                })}
                            </tbody>

                        </table>
                    </div>
                    <div>
                        <div style={{ float: 'left' }}>
                            <label className="font-weight-bold font-size-xs text-muted">{translate("DATAGRID.STATUS.NRECORD").replace("%n%", rawData.length)}</label>
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
                                    this.setState({ itemCount: p, page: newPage });
                                })} />
                            </div>
                            <div style={{ marginRight: 3 }}>
                                <FastPagination max={data.length} itemCount={this.state.itemCount} page={this.state.page} setPage={(p) => { this.setState({ page: p }) }}></FastPagination>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
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
        const page = this.props.page;
        const itemCount = this.props.itemCount;
        const count = this.props.max;
        const setPage = this.props.setPage;
        const pageCount = Math.ceil(count / (itemCount * 1.0));
        var items = [];
        var stepCount = Math.min(6, pageCount);
        var startIndex = Math.round(Math.max(0, (page - stepCount / 2.0)));
        var endIndex = Math.min(pageCount, startIndex + stepCount);

        if (startIndex > 0) items.push(["<<", 0]);
        if (page > startIndex && startIndex > 0) {
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
            return <li style={{ margin: 5 }} key={"k" + item} className={`page-item ${item[1] === page ? 'active' : null}`}>
                <button style={{ padding: 10 }} onClick={() => { setPage(item[1]) }} className="page-link" style={{ borderRadius: '100%', width: 36, height: 36, boxShadow: getElevation(item[1] === page ? 2 : 0) }}>{item[0]}</button>
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
        return <div style={{ display: block ? 'block' : 'inline-block', flex: 1 }}>
            <input placeholder={searchTitle} style={{ maxWidth: 300, width: '100%', ...style }} className="form-control" type="text" value={this.props.value} onChange={(evt) => { this.props.setValue(evt.target.value) }} />
            {found !== null && found !== undefined && (this.props.value || "").length > 0 ? (
                <label className="text-muted font-weight-bold font-italic font-size-xs p-1 pt-3">{foundTranslated.replace("%n%", found)}</label>
            ) : null
            }
        </div>
    }
}

class FastGridCreate extends Component {
    render() {

        return <div>
            <button onClick={() => { this.props.setMode('new') }} className="btn btn-primary"><i className="bi bi-plus"></i> {translate("DATAGRID.ACTION.CREATE")}</button>
        </div>
    }
}

class FastGridNewForm extends Component {
    state = {
    }
    constructor(props) {
        super(props);
        this.state = { ...this.state, ...props.editData };
    }
    submit(ctx) {
        if (ctx.action === 'cancel') {
            this.props.setMode('grid');
            this.props.resetEdit();
        }
        else {
            ctx.submit();
        }
    }
    getFormField(name) {
        return this.state[name];
    }
    setFormField(name, value) {
        this.setState({
            [name]: value
        });
    }
    getFieldProps(name, onChange) {
        return {
            datagrid: this.props.datagrid, name: name, value: this.state[name], onChange: (v) => {
                if (v.checked) v = v.checked;
                v = v.target ? v.target.value : v;
                this.setState({ [name]: v });
                if (onChange) onChange(v, name);
            }
        };
    }
    render() {
        const isEditMode = this.props.mode === 'edit';
        var Form = (isEditMode ? this.props.edit : this.props.create);
        if (typeof Form === 'boolean') Form = null;
        const state = this.state;

        return <div>
            <FastForm title={translate(`DATAGRID.${isEditMode ? 'EDIT' : 'NEW'}.TITLE`).replace("%str%", this.props.title)} headerActions={[FastForm.Cancel]} actions={[FastForm.Save]} submit={this.submit.bind(this)}>
                {(Form === null || Form === undefined) ? React.Children.map(this.props.children, child => {
                    var hideParts = (child.props.hide || "").split(",");
                    if (hideParts.indexOf(isEditMode ? 'edit' : 'new') > -1) return <div></div>;

                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            datagrid: this.props.datagrid, value: state[child.props.name], onChange: (v) => {
                                if (v.checked) v = v.checked;
                                this.setState({ [child.props.name]: v.target ? v.target.value : v });
                            }
                        });
                    }
                    return child;
                }) : <Form {...this.props} getFieldProps={this.getFieldProps.bind(this)} getFormField={this.getFormField.bind(this)} setFormField={this.setFormField.bind(this)} />}
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


        return <div style={{ display: 'inline-block' }}>


            <div className={`dropdown ${isPopoverOpen ? 'show' : ''}`}>
                <a type="button" data-toggle="dropdown" onClick={setIsPopoverToggle.bind(this)} href="#" style={{ borderRadius: 0, marginLeft: 2 }}>
                    <i className="bi bi-filter" style={{ color: 'black' }}></i>
                </a>
                <div className={`dropdown-menu ${isPopoverOpen ? 'show' : ''}`} aria-labelledby={this.id} style={{ padding: 5, minWidth: 300 }}>
                    <FastGridSearchBox data={filterList} block style={{ maxWidth: '100%', width: '100%' }} value={this.state.searchText} setValue={setSearchText} />
                    {selectedCount > 0 && <div className="alert alert-dark mt-3 p-4" style={{ borderRadius: 6, boxShadow: '0px 3px 10px rgba(0,0,0,0.15)' }}>
                        <div className="row">
                            <div className="col" dangerouslySetInnerHTML={{ __html: translate("DATAGRID.FILTER.SELECTED.NRECORD").replace("%n%", selectedCount).replace("%m%", filterCount) }} ></div>
                        </div>
                    </div>}
                    <div style={{ marginTop: 10, maxHeight: 250, height: 250, overflowY: 'scroll', padding: 3, overflowX: 'hidden' }}>
                        <div className="list-group">
                            {filterList.filter((item, i) => i < 5000).map((item, index) => <button className="list-group-item list-group-item-action" style={{ margin: 0, display: 'flex', padding: 5 }}>

                                <div className="custom-control custom-checkbox" style={{ position: 'relative' }}>
                                    <input type="checkbox" checked={this.state.selectedItems.indexOf(item) > -1} onChange={() => {
                                        console.log(item);
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
                        <button className="btn btn-primary" style={{ flex: 1, margin: 3 }}>{translate("DATAGRID.FILTER.APPLY")}</button>
                        <button className="btn btn-outline-dark" style={{ flex: 1, margin: 3 }}>{translate("DATAGRID.FILTER.RESET")}</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}