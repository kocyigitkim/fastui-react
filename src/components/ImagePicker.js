import React from 'react';
import { CustomField } from "./CustomField";
import { translate } from '../utils';
import filesize from 'filesize'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
import { ReactBridge } from '../ReactBridge';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};


export class ImagePickerField extends CustomField {
    state = {
        files: [],
        dragEntered: false
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
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
        var newFiles = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            file.index = i;
            file.id = uuid();
            if (!file.type.startsWith("image/")) {
                continue;
            }
            file.base64Data = await toBase64(file).catch(console.error);
            newFiles.push(file);
        }
        if (files.length > 0 && newFiles.length != files.length) {
            //error: unsupported file type
        } else {
            if (this.props.onChange) this.props.onChange(newFiles);
        }
        return newFiles;
    }
    uploadFile() {
        console.log(this.fileUpload);
        this.fileUpload.click();
    }
    async handleFileUpload(evt) {
        this.setState({
            files: await this.processFiles.call(this, evt.target.files)
        });
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

        const firstFile = value || this.state.files[0];

        return <div className="form-group">
            <input accept="image/*" onChange={this.handleFileUpload.bind(this)} multiple={multi} type="file" ref={(r) => this.fileUpload = r} style={{ display: 'none' }} />
            <label className="text-dark font-weight-bold text-lg mb-2">{translate(title)}</label>
            <div {...dragProps} className="border border-secondary rounded p-3" style={{ minHeight: 100, maxHeight: 300, overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
                {isEmpty ? (<div className="p-2">
                    <div style={{ float: 'right', height: '100%' }}>
                        <button onClick={this.uploadFile.bind(this)} type="button" className="btn btn-primary btn-size-lg" style={{ height: 70, minWidth: 100 }}><i className="bi bi-upload"></i> {translate("IMAGEPICKER.EMPTY.UPLOAD")}</button>
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
        });
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
                                <Draggable key={item.id} draggableId={item.id} index={index}>
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
                    <label>{firstFile && firstFile.type} {firstFile && filesize(firstFile.size)}</label>
                </div>
            </div>
            <div className="col-sm-12 col-xs-6 col-md-6">
                <button onClick={() => { this.setState({ files: this.state.files.filter((item) => item.index != firstFile.index), dragEntered: false }); }} type="button" className="btn btn-outline-danger btn-size-lg"
                    style={{ height: compact ? 70 : '100%', minWidth: compact ? 70 : 100, float: 'right' }}><i className="bi bi-trash"></i>{translate('IMAGEPICKER.FILLED.REMOVE')}</button>
            </div>
        </div>;
    }
}

