import { getApiHandler } from ".";

export class FileUploadResult {
    /**
     * 
     * @param {Boolean} success 
     * @param {String} message 
     * @param {String} fileId 
     */
    constructor(success, message, fileId) {
        this.success = success;
        this.message = message;
        this.fileId = fileId;
    }
}
export class FileDownloadData {
    constructor() {
        this.name = null;
        this.type = null;
        this.size = 0;
        this.base64Data = null;
    }
}
export class FileDownloadResult {
    /**
     * 
     * @param {Boolean} success 
     * @param {String} message 
     * @param {FileDownloadData} data
     */
    constructor(success, message, data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}
export class FileProvider {
    getDataExtractor() {
        /** @param {File} file */
        return async (file) => {
            return new Promise((resolve, reject) => {
                var fr = new FileReader();
                fr.onload = (evt) => {
                    resolve(evt.target.result);
                };
                fr.onerror = (evt) => {
                    reject(evt.target.error);
                }
                fr.readAsDataURL(file);
            });
        };
    }
    /** 
    @param {File} file 
    @returns {Promise<FileUploadResult>}
    */
    async upload(file, dataExtractor) {
        return new FileUploadResult(false, null, null);
    }
    /** 
    @param {String} fileId
    @returns {Promise<FileDownloadResult>}
     */
    async download(fileId) {
        return new FileDownloadResult(false, null);
    }
}

export class RemoteFileProvider {
    /**
     * 
     * @param {String} options.basePath
     * @param {String} options.uploadPath
     * @param {String} options.downloadPath
     */
    constructor(options = null) {
        if (!options) options = {};

        if (!options.basePath) options.basePath = "file";
        if (!options.uploadPath) options.uploadPath = "upload";
        if (!options.downloadPath) options.downloadPath = "download";
        this.options = options;
    }
    /**
     * 
     * @param {File} file 
     * @param {Function} dataExtractor 
     * @returns {Promise<FileUploadResult>}
     */
    async upload(file, dataExtractor) {
        if (!dataExtractor) {
            dataExtractor = this.getDataExtractor();
        }
        const api = getApiHandler();
        const { basePath, uploadPath } = this.options;
        var data = dataExtractor(file);
        if (data instanceof Promise) data = await data.catch(console.error);

        var result = await api.execute(basePath, uploadPath, {
            name: file.name,
            type: file.type,
            size: file.size,
            data: data
        }, "post").catch(console.error);
        if (result && result.success) {
            return new FileUploadResult(true, null, result.data.Id);
        }
        return new FileUploadResult(false, (result && result.message) || "FILE.UPLOAD.ERROR", null);
    }
    /**
     * 
     * @param {String} fileId 
     * @returns {Promise<FileDownloadResult>}
     */
    async download(fileId) {
        const api = getApiHandler();
        const { basePath, downloadPath } = this.options;

        const result = await api.execute(basePath, downloadPath, {
            Id: fileId
        }, "post").catch(console.error);
        if (result && result.success) {
            return new FileDownloadResult(true, null, result.data);
        }
        return new FileDownloadResult(false, (result && result.message) || "FILE.DOWNLOAD.ERROR", null);
    }
}