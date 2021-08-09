import React, { Component } from 'react'
import { chooseOne, getElevation, toTitleCase, translate } from '../utils';
import Loading from './Loading'
import { getApiHandler } from './../utils';
import toast from 'react-hot-toast';

export class FastForm extends Component {
    state = {
        loading: false,
        detailData: null
    }
    static Inherit = {
        getFieldProps: () => { },
        getFormField: () => { },
        setFormField: () => { }
    };

    constructor(props) {
        super(props);
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
        const api = getApiHandler();
        var response = await api.execute(this.props.path, action, request, "POST");
        await new Promise(resolve => setTimeout(resolve, 1000));
        if(!response ||response.success===false){
            var errMessage = translate(response ? response.message : 'FORM.SAVE.ERROR');
            toast.error(errMessage);
        }
        else{
            if(response && response.success){
                toast.success(translate('FORM.SAVE.SUCCESS'));
            }
        }
        var actionEvent = this.props["on" + toTitleCase(action)];
        if (actionEvent) {
            actionEvent(response, request);
        }
        this.setState({ loading: false });
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
        const _form = this;
        return {
            form: this, name: name, value: this.state[name], onChange: (v) => {
                if (v.checked) v = v.checked;
                v = v.target ? v.target.value : v;
                _form.setState({ [name]: v });
                if (onChange) onChange.call(_form, v, name);
            }
        };
    }

    async actionOnClick(action) {
        action = action.action;

        var formData = new FormData(this.frm);
        var request = {};

        for (var entry of formData.entries()) {
            var isExists = Boolean(request[entry[0]]);
            var value = request[entry[0]];
            if (isExists) {
                request[entry[0]] = value.length >= 0 ? [...value, entry[1]] : [value, entry[1]];
            }
            else {
                request[entry[0]] = entry[1];
            }
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
        if (datasource) {
            this.setState({ loading: true });
            await datasource.retrieve();
            if (Array.isArray(datasource.records)) {
                this.setState({ loading: false, ...(datasource.records || [])[0] });
            }
            else {
                this.setState({ loading: false, ...(datasource.records || {}) });
            }
        }
    }
    loadDetail(data) {
        this.setState({ ...data });
    }
    render() {
        const { title, loading, actions, headerActions, outlined, submit, elevation, elevationColor } = this.props;
        const shadowConfig = getElevation(chooseOne(elevation, 5), chooseOne(elevationColor, '#000'));

        return (
            <form ref={(r => this.frm = r)} method="post" >
                <div className="card" style={{ borderRadius: 10, boxShadow: outlined ? null : shadowConfig }}>
                    <Loading show={this.state.loading}>{translate(loading || "FORM.LOADING")}</Loading>
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

FastForm.Actions = class FastFormActions extends Component {
    render() {
        return <div className="card-footer" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            {this.props.children}
        </div>;
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


FastForm.ActiveDeactive = class FastFormActiveDeactiveAction extends Component {
    static action = 'delete';
    render() {
        const { data } = this.props;
        const setState = () => {
            (data || {}).IsActive = !Boolean((data || {}).IsActive);
            this.forceUpdate();
        };
        return <FastForm.CustomAction className="btn btn-outline-dark" title={`FORM.SET.${!(data || {}).IsActive ? 'ACTIVE' : 'DEACTIVE'}`} {...this.props} onClick={setState} style={{ padding: '7px 20px', ...this.props.style }}><i className={`bi bi-${!(data || {}).IsActive ? 'eye' : 'eye-slash'} mr-2`}></i></FastForm.CustomAction>;
    }
}
