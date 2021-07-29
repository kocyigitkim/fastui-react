import { CKEditor } from '@ckeditor/ckeditor5-react'
import React, { Component } from 'react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import './styles/RichText.css';
import { CustomField } from "./CustomField";
import { translate } from '../utils';

var __rawStyleChild = global.window.document.createElement("style");
__rawStyleChild.innerText = `
.ck-editor__editable {
    min-height: 300px !important;
}
`;
global.window.document.head.appendChild(__rawStyleChild);

class CKTextEditor extends Component {
    isInit = false;
    render() {
        const isInit = this.isInit;
        var initEditor = false;
        if (!isInit) {
            this.isInit = true;
            initEditor = true;
        }
        const custom_config = {
            extraPlugins: [MyCustomUploadAdapterPlugin],
            alignment: {
                options: ['left', 'right', 'center', 'justify']
            },
            toolbar: {
                items: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'alignment',
                    'blockQuote',
                    'insertTable',
                    '|',
                    'imageUpload',
                    'undo',
                    'redo'
                ]
            },
            table: {
                contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
            }
        };


        const props = this.props;
        return (
            <CKEditor config={custom_config} {...props} style={{ ...props.style, minHeight: '300px' }} editor={ClassicEditor}></CKEditor>
        )
    }
}

function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader)
    }
}

class MyUploadAdapter {
    constructor(props) {
        this.loader = props;
    }

    upload() {
        return new Promise((resolve, reject) => {
            this._initListeners(resolve, reject);
        });
    }

    abort() {
    }

    async _initListeners(resolve, reject) {
        const xhr = this.xhr;
        const loader = this.loader;
        const file = loader.file instanceof Promise ? (await loader.file) : loader.file;
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        resolve({
            default: await toBase64(file)
        });
    }

}

export default class RichTextField extends CustomField {
    form() {
        const { title, name, description } = this.props;
        const translated = translate(title || name);
        return (<div className="form-group">
            {title && <div className="form-label font-weight-bold mb-2">{translated}</div>}
            <CKTextEditor {...this.props}></CKTextEditor>
            {description && <div className="text-muted">{translate(description)}</div>}
        </div>
        )
    }
}
