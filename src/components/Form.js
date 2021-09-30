import React, { Component } from 'react'
import { chooseOne, getElevation, toTitleCase, translate } from '../utils';
import Loading from './Loading'
import { getApiHandler } from './../utils';
import toast from 'react-hot-toast';
import { DynoState } from 'faststate-react/states/DynoState';


export class FastForm extends Component {
    state = {
        loading: false,
        detailData: null
    }
    _state = new DynoState();
    static Inherit = {
        getFieldProps: () => { },
        getFormField: () => { },
        setFormField: () => { }
    };

    constructor(props) {
        super(props);
        this.getState = this.getState.bind(this);
        this.getFormField = this.getFormField.bind(this);
        this.setFormField = this.setFormField.bind(this);
        this.getFieldProps = this.getFieldProps.bind(this);
    }

    async onSubmit(action, request) {
        this.setState({ loading: true });
        var formId = this.props.editId;
        const path = this.props.path;
        const IdSelector = this.props.IdSelector || "Id";
        if (formId && this.props.editId) {
            request[IdSelector] = this.props.editId;
        }
        const requestMapper = this.props.requestMapper || ((action, r) => r);
        request = requestMapper(action, request);
        const api = getApiHandler();
        var response = await api.execute(this.props.path, action, request, "POST");
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!response || response.success === false) {
            var errMessage = translate(response ?
                response.fields && response.fields.length > 0 ? (response.fields[0].code)
                    : response.message
                : 'FORM.SAVE.ERROR');
            toast.error(errMessage);
        }
        else {
            if (response && response.success) {
                toast.success(translate('FORM.SAVE.SUCCESS'));
            }
        }
        var actionEvent = this.props["on" + toTitleCase(action)];
        if (actionEvent) {
            actionEvent(response, request);
        }
        this.setState({ loading: false });
    }
    getState() {
        return this.props.state || this._state;
    }
    getFormField(name) {
        return this.getState().value(null, name);
    }
    setFormField(name, value) {
        this.getState().value(null, name).writeUpdate(value);
    }
    getFieldProps(name, onChange) {
        const fieldValueRef = this.getState().value(null, name);
        return {
            form: this, name: name, value: fieldValueRef, onChange: (v) => {
                if (v !== null && v !== undefined) {
                    if (v.checked) v = v.checked;
                    v = v.target ? v.target.value : v;
                }
                if (onChange) onChange(v, name);
            }
        };
    }

    async actionOnClick(action) {
        action = action.action;
        var request = { ...this.props.extraArgs, ...this.getState().fields };

        for (var fieldName in request) {
            var fieldValue = request[fieldName];
            if (Array.isArray(fieldValue)) {
                fieldValue = fieldValue.map(item => {
                    return processFieldValue(item);
                });
            }
            else {
                fieldValue = processFieldValue(fieldValue);
            }
            request[fieldName] = fieldValue;
        }

        const context = {
            action: action,
            data: request,
            submit: (() => { this.onSubmit.call(this, action, request); }).bind(this)
        };

        if (this.props.submit) {
            this.props.submit.call(this, context);
        }
        else {
            this.onSubmit.call(this, action, request);
        }
    }

    async componentDidMount() {
        var datasource = this.props.datasource;
        var extraArgs = this.props.extraArgs;
        if (datasource) {
            this.setState({ loading: true });
            datasource.args = { ...extraArgs, ...datasource.args };
            await datasource.retrieve();
            if (datasource.records.length === 0 && datasource.rawResult && datasource.rawResult.data && !Array.isArray(datasource.rawResult.data)) {
                datasource.records = [datasource.rawResult.data];
            }
            if (Array.isArray(datasource.records)) {
                setTimeout(() => {
                    this.setState({ loading: false }, () => {
                        this.getState().setAll({ ...(datasource.records || [])[0] });
                    });
                }, 500);
            }
            else {
                setTimeout(() => {
                    this.setState({ loading: false }, () => {
                        this.getState().setAll({ ...(datasource.records || {}) });
                    });
                }, 500);

            }
        }
    }

    render() {
        const { title, loading, actions, headerActions, outlined, contentOnly, elevation, elevationColor } = this.props;
        var shadowConfig = getElevation(chooseOne(elevation, 5), chooseOne(elevationColor, '#000'));
        if (contentOnly) {
            shadowConfig = null;
            return (
                <form ref={(r => this.frm = r)} method="post" >
                    <div style={{ borderRadius: 10, boxShadow: outlined ? null : shadowConfig }}>
                        <Loading show={this.props.loading || this.state.loading}>{translate(loading || "FORM.LOADING")}</Loading>
                        <div {...this.props.cardBody}>
                            {typeof this.props.children === 'function' ? this.props.children.call(this, this) : this.props.children}
                        </div>
                        {actions && (<FastForm.Actions contentOnly>
                            {actions.map((Action, index) => <Action onClick={this.actionOnClick.bind(this, Action)} key={"k" + index} style={{ margin: 5 }} form={this}></Action>)}
                        </FastForm.Actions>)}
                    </div>
                </form>
            )
        }
        else {
            return (
                <form ref={(r => this.frm = r)} method="post" >
                    <div className="card" style={{ borderRadius: 10, boxShadow: outlined ? null : shadowConfig }}>
                        <Loading show={this.props.loading || this.state.loading}>{translate(loading || "FORM.LOADING")}</Loading>
                        {(title || headerActions) && <div className="card-header" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <div style={{ display: 'flex' }}>
                                <h5 style={{ flex: 1 }} className="card-title">{translate(title)}</h5>
                                {headerActions && (<div>
                                    {headerActions.map((Action, index) => <Action onClick={this.actionOnClick.bind(this, Action)} key={"k" + index} style={{ margin: 5 }} form={this}></Action>)}
                                </div>)}
                            </div>
                        </div>
                        }
                        <div className="card-body" {...this.props.cardBody}>
                            {typeof this.props.children === 'function' ? this.props.children.call(this, this) : this.props.children}
                        </div>
                        {actions && (<FastForm.Actions>
                            {actions.map((Action, index) => <Action onClick={this.actionOnClick.bind(this, Action)} key={"k" + index} style={{ margin: 5 }} form={this}></Action>)}
                        </FastForm.Actions>)}
                    </div>
                </form>
            )
        }
    }
}

function processFieldValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'object') {
        if (value.fastuiField) {
            return value.fastuiField(value);
        }
    }
    return value;
}

FastForm.Actions = class FastFormActions extends Component {
    render() {
        const contentOnly = this.props.contentOnly;
        if (contentOnly) {
            return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {this.props.children}
            </div>;
        }
        else {
            return <div className="card-footer" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {this.props.children}
            </div>;
        }
    }
};

FastForm.CustomAction = class FastFormCustomAction extends Component {
    render() {
        const { title, action } = this.props;
        const translated = translate(title);

        return <div style={{ display: 'contents' }}>
            <button {...{ ...this.props, form: null, title: translated }} type="button" onClick={this.props.onClick}>{this.props.children}{translated}</button>
        </div>;
    }
}

FastForm.Cancel = class FastFormCancelAction extends Component {
    static action = 'cancel';
    render() {
        return <FastForm.CustomAction className="btn btn-outline-danger" title="FORM.CANCEL" {...this.props} style={{ padding: '7px 20px', ...this.props.style }}><i className="bi bi-x-lg mr-2"></i></FastForm.CustomAction>;
    }
};

FastForm.Save = class FastFormSaveAction extends Component {
    static action = 'save';
    render() {
        return <FastForm.CustomAction className="btn btn-primary" title="FORM.SAVE" {...this.props} style={{ padding: '7px 20px', ...this.props.style }}><i className="bi bi-save mr-2"></i></FastForm.CustomAction>;
    }
};

FastForm.Delete = class FastFormDeleteAction extends Component {
    static action = 'delete';
    render() {
        return <FastForm.CustomAction className="btn btn-outline-dark" title="FORM.DELETE" {...this.props} style={{ padding: '7px 20px', ...this.props.style }}><i className="bi bi-trash mr-2"></i></FastForm.CustomAction>;
    }
}

FastForm.Edit = class FastFormEditAction extends Component {
    static action = 'delete';
    render() {
        return <FastForm.CustomAction className="btn btn-outline-primary" title="FORM.EDIT" {...this.props} style={{ padding: '7px 20px', ...this.props.style }}><i className="bi bi-pen mr-2"></i></FastForm.CustomAction>;
    }
}

FastForm.View = class FastFormViewAction extends Component {
    static action = 'detail';
    render() {
        return <FastForm.CustomAction className="btn btn-outline-dark" title="FORM.VIEW" {...this.props} style={{ padding: '7px 20px', ...this.props.style }}><i className="bi bi-arrow-up-right-square mr-2"></i></FastForm.CustomAction>;
    }
}

FastForm.ActiveDeactive = class FastFormActiveDeactiveAction extends Component {
    static action = 'setstate';
    isActive = false;
    constructor(props) {
        super(props);

    }
    componentDidMount() {
        this.update.call(this);
    }
    componentDidUpdate() {
        this.update.call(this);
    }
    update() {
        const props = this.props;
        if (props.data && (props.data.IsActive || props.data.isActive)) {
            this.isActive = true;
        }
        else if (Array.isArray(props.data) && props.data.filter(p => p.IsActive || p.isActive).length > 0) {
            this.isActive = true;
        }
    }
    render() {
        const { data, idField, ids } = this.props;
        const setState = async () => {
            if (this.props.datagrid) {
                const apiHandler = getApiHandler();
                var errorCount = 0, successCount = 0;
                this.isActive = !this.isActive;
                for (var id of ids) {
                    var result = await apiHandler.execute(this.props.datagrid.props.path, "setState", {
                        [idField]: id,
                        value: this.isActive
                    }, "post");
                    if ((result && result.success === false) || !result) {
                        errorCount++;
                    }
                    else {
                        successCount++;
                    }
                }

                if (successCount > 0 && errorCount === 0) {
                    toast.success(translate("FORM.SAVE.SUCCESS"));
                }
                else if (errorCount > 0 && successCount === 0) {
                    toast.error(translate("FORM.SAVE.ERROR"));
                }
                else {
                    toast.warning(translate("FORM.SAVE.WARNING"));
                }
            }
            else {
                if (ids.length === 1) {
                    (data || {}).IsActive = !Boolean((data || {}).IsActive);
                }
            }
            if (ids.length > 0) {
                if (data && Array.isArray(data)) {
                    data.filter(p => ids.indexOf(p[idField]) > -1).forEach(p => p.IsActive = this.isActive);
                } else if (data) {
                    data.IsActive = this.isActive;
                }
            }
            else {
                if (data) this.isActive = data.IsActive;
            }
            await this.props.datagrid.refreshList();
        };
        const IsActive = this.isActive;
        return <FastForm.CustomAction className="btn btn-outline-dark" title={`FORM.SET.${!IsActive ? 'ACTIVE' : 'DEACTIVE'}`} {...this.props} onClick={setState} style={{ padding: '7px 20px', ...this.props.style }}><i className={`bi bi-${!IsActive ? 'eye' : 'eye-slash'} mr-2`}></i></FastForm.CustomAction>;
    }
}
