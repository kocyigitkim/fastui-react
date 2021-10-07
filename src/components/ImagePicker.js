import React from 'react';
import { CustomField } from "./CustomField";
import { getFileProvider, translate } from '../utils';
import filesize from 'filesize'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
import { ReactBridge } from '../ReactBridge';
import toast from 'react-hot-toast';
import Loading from './Loading';
import { Field } from './Field'

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};


export class ImagePickerField extends CustomField {
    state = {
        files: [],
        dragEntered: false,
        loading: false
    }
    __id = uuid();

    grid() {
        const { title, name, value, type } = this.props;

        return <div>{(value || "").toString()}</div>;
    }
    handleDragEnter = (e) => {
        e.preventDefault();

        this.setState({ dragEntered: true });
        e.dataTransfer.dropEffect = 'move';
    }
    handleDragLeave = (e) => {
        e.preventDefault();

        this.setState({ dragEntered: false });
    }
    handleDragDrop = async (e) => {
        e.preventDefault();
        this.setState({ dragEntered: false, files: await this.processFiles.call(this, e.dataTransfer.files || []) });
    }
    async processFiles(files) {
        this.setState({ loading: true });
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
        var newFiles = [...this.state.files];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (!file.type.startsWith("image/")) {
                continue;
            }
            file.base64Data = await toBase64(file).catch(console.error);
            const fileProvider = getFileProvider();
            var result = await fileProvider.upload(file, (file) => file.base64Data);
            console.log('UPLOAD', result);
            if (result.success) {
                file.fileId = result.fileId;
            } else {
                toast.error(translate(result.message));
                continue;
            }

            file.fastuiField = ((self) => {
                return self.fileId;
            }).bind(file, file);
            newFiles.push(file);
        }

        if (this.props.onChange) this.props.onChange(newFiles);
        this.fileUpload.value = "";
        this.setState({ loading: false });
        return newFiles;
    }
    uploadFile() {
        this.fileUpload.click();
    }
    async handleFileUpload(evt) {
        this.setState({
            files: await this.processFiles.call(this, evt.target.files)
        });
    }
    async componentDidMount() {
        try {
            if (this.props.value) {
                this.setState({ loading: true });
                var files = [];
                var values = this.props.value;
                if (!Array.isArray(this.props.value)) {
                    values = [values];
                }
                for (var i = 0; i < values.length; i++) {
                    var fileId = values[i];
                    const fileProvider = getFileProvider();
                    var result = await fileProvider.download(fileId);
                    if (result.success) {
                        var file = {
                            fileId: fileId,
                            name: result.data.name,
                            size: result.data.size,
                            type: result.data.type,
                            base64Data: result.data.base64Data
                        };
                        file.fastuiField = ((self) => {
                            return self.fileId;
                        }).bind(file, file);

                        files.push(file);
                    }
                }
                this.setState({ files: files, loading: false });
            }
        } catch (err) { }
    }
    async componentDidUpdate() {
        if (this.props.value) {
            if (this.props.value.length > 0 && this.state.files.length === 0) {
                if (this.inited) return;
                this.inited = true;
                this.componentDidMount.call(this);
            }
        }
    }
    form() {
        const { title, description, mini, multi, value } = this.props;
        const emptyTitle = translate("IMAGEPICKER.EMPTY.TITLE");
        const emptyDesc = translate("IMAGEPICKER.EMPTY.DESC");
        const isEmpty = this.state.files.length === 0;
        const isDragEntered = this.state.dragEntered;
        const dragProps = {
            onDragEnter: this.handleDragEnter.bind(this),
            onDragOver: this.handleDragEnter.bind(this),
            onDrop: this.handleDragDrop.bind(this),
            onDragLeave: this.handleDragLeave.bind(this)
        };

        const firstFile = Array.isArray(this.state.files) ? this.state.files[0] : null;
        const addButton = multi && this.state.files.length > 0 ? (
            <div className="p-2">
                <div style={{ float: 'right', height: '100%' }}>
                    <Field onClick={this.uploadFile.bind(this)} type="button" color="primary" style={{ height: 70, minWidth: 100 }} left={<i className="bi bi-upload"></i>} title="IMAGEPICKER.EMPTY.UPLOAD"></Field>
                </div>
                <p>{emptyDesc}</p>
            </div>
        ) : null;

        return <div className="form-group">
            <Loading show={this.state.loading} />
            <input accept="image/*" onChange={this.handleFileUpload.bind(this)} multiple={multi} type="file" ref={(r) => this.fileUpload = r} style={{ display: 'none' }} />
            <label className="text-dark font-weight-bold text-lg mb-2">{translate(title)}</label>
            <div {...dragProps} className="border border-secondary rounded p-3" style={{ minHeight: 100, maxHeight: this.props.disableMaxHeight ? 'none' : 300, overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
                {isEmpty ? (<div className="p-2">
                    <div style={{ float: 'right', height: '100%' }}>
                        <Field onClick={this.uploadFile.bind(this)} type="button" color="primary" style={{ height: 70, minWidth: 100 }} left={<i className="bi bi-upload"></i>} title="IMAGEPICKER.EMPTY.UPLOAD"></Field>
                    </div>
                    <label className="text-dark font-weight-bold">{emptyTitle}</label>
                    <p>{emptyDesc}</p>
                </div>) : (<div>
                    {multi ? this.renderMulti.call(this) : this.renderSingle.call(this, firstFile)}
                </div>)}
                <div style={{ position: 'absolute', transition: 'all 300ms ease', opacity: (isDragEntered ? 1 : 0), pointerEvents: 'none', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-mouse3 font-weight-bold text-dark" style={{ fontSize: '2rem' }}></i>
                    <label className="font-weight-bold text-dark mt-3">{translate("IMAGEPICKER.DRAGDROP.MESSAGE")}</label>
                </div>
                {addButton}
            </div>
            {description && <label className="text-muted font-italic mt-2 font-weight-bold" style={{ fontSize: '0.8rem' }}>{description}</label>}
        </div>;
    }

    onDragEnd(result) {

        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            this.state.files,
            result.source.index,
            result.destination.index
        );

        this.setState({
            files: items
        }, this.props.onChange && (() => {
            this.props.onChange(this.state.files.map(f => f.fileId));
        }));
    }

    renderMulti() {
        var files = this.state.files;
        return <ReactBridge ref={r => this.multiBridge = r}>
            <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
                <Droppable droppableId={this.__id}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ ...snapshot.isDraggingOver }}
                        >
                            {files.map((item, index) => (
                                <Draggable key={item.fileId} draggableId={item.fileId} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{ ...snapshot.isDragging, ...provided.draggableProps.style }}
                                        >
                                            {this.renderSingle.call(this, item, true)}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </ReactBridge>;
    }

    renderSingle(firstFile, compact) {
        return <div className="row">
            <div className="col-xs-12 col-sm-6 col-md-6" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                    width: 86, height: 86, borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)',
                    background: `url(${firstFile && firstFile.base64Data}) no-repeat`, backgroundPosition: 'center center', backgroundSize: 'contain'
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 10 }}>
                    <label style={{ fontWeight: 'bold', marginBottom: 3, maxWidth: 250 }}>{firstFile && firstFile.name}</label>
                    <label>{firstFile && firstFile.type} {firstFile && filesize(isNaN(firstFile.size) ? 0 : firstFile.size)}</label>
                </div>
            </div>
            <div className="col-sm-12 col-xs-6 col-md-6">
                <Field onClick={() => { this.setState({ files: this.state.files.filter((item) => item.fileId != firstFile.fileId), dragEntered: false }); }} type="button" color="danger" outline
                    style={{ height: compact ? 70 : '100%', minWidth: compact ? 70 : 100, float: 'right' }} left={<i className="bi bi-trash"></i>} title="IMAGEPICKER.FILLED.REMOVE"></Field>
            </div>
        </div>;
    }
}

