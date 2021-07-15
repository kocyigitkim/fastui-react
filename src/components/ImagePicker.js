import React from 'react';
import { CustomField } from './Form';
import { translate } from '../utils';
import filesize from 'filesize'

export class ImagePickerField extends CustomField {
    state = {
        files: [],
        dragEntered: false
    }
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
            if (!file.type.startsWith("image/")) {
                continue;
            }
            file.base64Data = await toBase64(file).catch(console.error);
            newFiles.push(file);
        }
        if(files.length >0 && newFiles.length!=files.length){
            //error: unsupported file type
        }
        return newFiles;
    }
    form() {
        const { type, placeholder, title, description, mini, multi } = this.props;
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

        const firstFile = this.state.files[0];

        return <div className="form-group">
            <input type="hidden" ref={(r) => this.fileUpload = r} className="hidden" />
            <label className="text-dark font-weight-bold text-lg mb-2">{translate(title)}</label>
            <div {...dragProps} className="border border-secondary rounded p-3" style={{ minHeight: 100, maxHeight: 300, overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
                {isEmpty ? (<div className="p-2">
                    <div style={{ float: 'right', height: '100%' }}>
                        <button type="button" className="btn btn-primary btn-size-lg" style={{ height: 70, minWidth: 100 }}><i className="bi bi-upload"></i> {translate("IMAGEPICKER.EMPTY.UPLOAD")}</button>
                    </div>
                    <label className="text-dark font-weight-bold">{emptyTitle}</label>
                    <p>{emptyDesc}</p>
                </div>) : (<div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-md-6" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                width: 96, height: 96, borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)',
                                background: `url(${firstFile && firstFile.base64Data}) no-repeat`, backgroundPosition: 'center center', backgroundSize: 'contain'
                            }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 10 }}>
                                <label style={{ fontWeight: 'bold', marginBottom: 3, maxWidth: 250 }}>{firstFile && firstFile.name}</label>
                                <label>{firstFile && firstFile.type} {firstFile && filesize(firstFile.size)}</label>
                            </div>
                        </div>
                        <div className="col-sm-12 col-xs-6 col-md-6">
                            <button onClick={() => { this.setState({ files: [], dragEntered: false }) }} type="button" className="btn btn-outline-danger btn-size-lg" style={{ height: '100%', minWidth: 100, float: 'right' }}>Kaldır</button>
                        </div>
                    </div>
                </div>)}
                <div style={{ position: 'absolute', transition: 'all 300ms ease', opacity: (isDragEntered ? 1 : 0), pointerEvents: 'none', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-mouse3 font-weight-bold text-dark" style={{ fontSize: '2rem' }}></i>
                    <label className="font-weight-bold text-dark mt-3">Yüklemeyi tamamlamak için bu alana bırakınız.</label>
                </div>
            </div>
        </div>;
    }

}
