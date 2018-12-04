/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import {
    AWS,
    ConsoleLogger as Logger,
    Hub,
    Credentials,
    Parser
} from '@aws-amplify/core';
import * as S3 from 'aws-sdk/clients/s3';
import { StorageOptions, StorageProvider } from '../types';

const logger = new Logger('AWSS3Provider');

const dispatchStorageEvent = (track, attrs, metrics) => {
    if (track) {
        Hub.dispatch('storage', { attrs, metrics }, 'Storage');
    }
};

/**
 * Provide storage methods to use AWS S3
 */
export default class AWSS3Provider implements StorageProvider {

    static CATEGORY = 'Storage';
    static PROVIDER_NAME = 'AWSS3';
    static PART_SIZE = 5242880;

    /**
     * @private
     */
    private _config;
    private uploadFiles = [];

    /**
     * Initialize Storage with AWS configurations
     * @param {Object} config - Configuration object for storage
     */
    constructor(config?: StorageOptions) {
        this._config = config ? config: {};
        logger.debug('Storage Options', this._config);
    }

    /**
     * get the category of the plugin
     */
    public getCategory(): string {
        return AWSS3Provider.CATEGORY;
    }

    /**
     * get provider name of the plugin
     */
    getProviderName(): string {
        return AWSS3Provider.PROVIDER_NAME;
    }

    /**
     * Configure Storage part with aws configuration
     * @param {Object} config - Configuration of the Storage
     * @return {Object} - Current configuration
     */
    public configure(config?): object {
        logger.debug('configure Storage', config);
        if (!config) return this._config;
        const amplifyConfig = Parser.parseMobilehubConfig(config);
        this._config = Object.assign({}, this._config, amplifyConfig.Storage);
        if (!this._config.bucket) { logger.debug('Do not have bucket yet'); }
        return this._config;
    }

    /**
    * Get a presigned URL of the file or the object data when download:true
    *
    * @param {String} key - key of the object
    * @param {Object} [config] - { level : private|protected|public, download: true|false }
    * @return - A promise resolves to Amazon S3 presigned URL on success
    */
    public async get(key: string, config?): Promise<String|Object> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('get ' + key + ' from ' + final_key);

        const params: any = {
            Bucket: bucket,
            Key: final_key
        };

        if (download === true) {
            return new Promise<any>((res, rej) => {
                s3.getObject(params, (err, data) => {
                    if (err) {
                        dispatchStorageEvent(
                            track,
                            { method: 'get', result: 'failed' },
                            null);
                        rej(err);
                    } else {
                        dispatchStorageEvent(
                            track,
                            { method: 'get', result: 'success' },
                            { fileSize: Number(data.Body['length']) });
                        res(data);
                    }
                });
            });
        }

        if (expires) { params.Expires = expires; }

        return new Promise<string>((res, rej) => {
            try {
                const url = s3.getSignedUrl('getObject', params);
                dispatchStorageEvent(
                    track,
                    { method: 'get', result: 'success' },
                    null);
                res(url);
            } catch (e) {
                logger.warn('get signed url error', e);
                dispatchStorageEvent(
                    track,
                    { method: 'get', result: 'failed' },
                    null);
                rej(e);
            }
        });
    }

    /**
     * Put a file in S3 bucket specified to configure method
     * @param {Stirng} key - key of the object
     * @param {Object} object - File to be put in Amazon S3 bucket
     * @param {Object} [config] - { level : private|protected|public, contentType: MIME Types,
     *  progressCallback: function }
     * @return - promise resolves to object on success
     */
    public async put(key: string, object, config?): Promise<Object> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, track, progressCallback } = opt;
        const { contentType, contentDisposition, cacheControl, expires, metadata } = opt;
        const { serverSideEncryption, SSECustomerAlgorithm, SSECustomerKey, SSECustomerKeyMD5, SSEKMSKeyId } = opt;
        const type = contentType ? contentType : 'binary/octet-stream';

        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('put ' + key + ' to ' + final_key);

        try {
            const createMultipartParams:any = {
                Bucket: bucket,
                Key: final_key
            };
            if (cacheControl) { createMultipartParams.CacheControl = cacheControl; }
            if (contentDisposition) { createMultipartParams.ContentDisposition = contentDisposition; }
            if (expires) { createMultipartParams.Expires = expires; }
            if (metadata) { createMultipartParams.Metadata = metadata; }
            if (serverSideEncryption) { 
                createMultipartParams.ServerSideEncryption = serverSideEncryption;
                if (SSECustomerAlgorithm) { createMultipartParams.SSECustomerAlgorithm = SSECustomerAlgorithm; }
                if (SSECustomerKey) { createMultipartParams.SSECustomerKey = SSECustomerKey; }
                if (SSECustomerKeyMD5) { createMultipartParams.SSECustomerKeyMD5 = SSECustomerKeyMD5; }
                if (SSEKMSKeyId) { createMultipartParams.SSEKMSKeyId = SSEKMSKeyId; }
            }

            
            let uploadId;
            return new Promise((res, rej) => {
                s3.createMultipartUpload(createMultipartParams, (err, data) => {
                    if (err) {
                        logger.debug('Upload error', err);
                        Promise.reject(err);
                    } else {
                        uploadId = data.UploadId;
                        
                        
                        
                        const fileSize = (typeof(object) === 'string')? object.length : object.size;
                        
                        
                        
                        const noOfParts = (fileSize <= AWSS3Provider.PART_SIZE) ? 1
                            : Math.ceil(fileSize / AWSS3Provider.PART_SIZE);

                        
                        this.uploadFiles.push
                            ({ Key: final_key, key ,uploadId, noOfParts, file: object,
                             externalPause: true, res, rej,status:'initiated',eTags:[],progressCallback});
                        
                        
                        this.uploadMultiPart(final_key, progressCallback,config);
                    }
                });
            });

            } catch (e) {
                logger.warn("error uploading", e);
                dispatchStorageEvent(
                    track,
                    { method: 'put', result: 'failed' },
                    null);

                throw e;
            }
        }

    
    public async cancelUpload(key: string, config?): Promise<any> {

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const cancelFileObject = this.uploadFiles.find(uploadFile => {
            if(uploadFile.Key === final_key){
                return uploadFile;
            }
        });
        if (cancelFileObject === undefined) {
            Promise.reject('Upload not found in cache');
        }
        const cancelParams = {
            Bucket: bucket,
            Key: final_key,
            UploadId: cancelFileObject.uploadId
        };
        
        const s3 = this._createS3(opt);
        let etags;
        try {
            const data = await s3.abortMultipartUpload(cancelParams).promise();
        
            // call listparts here to make sure parts is empty.
            this.uploadFiles.forEach(uploadFile => {
                if(uploadFile.Key === final_key){
                    uploadFile.status = 'cancelled';
                }
            });
            // call listparts to ensure etags are empty
            etags = await this.listparts(final_key,config);
            
            if(etags.length !== 0){
                    Promise.reject('Error cancelling your upload');
            }
            // remove from object
            this.uploadFiles.forEach(element => {
                if (element.Key === final_key) {
                   this.uploadFiles.splice(this.uploadFiles.indexOf(element),1);    
                }
            });
            
            Promise.resolve('Upload cancelled');
            }
            catch(error){
                Promise.reject(error);
            }
    }

    private async listparts(final_key, config?) {
    
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const s3 = this._createS3(opt);
    
        const listFileObject = this.uploadFiles.find(uploadFile => {
            if(uploadFile.Key === final_key){
    
                return uploadFile;
            }
        });
        const noOfparts = listFileObject.noOfParts;
        const etags = [];
        for (let i = 0; i < Math.ceil(noOfparts / 1000); i++) {
            const listparam = {
                Bucket: bucket,
                Key: final_key,
                UploadId: listFileObject.uploadId,
                MaxParts: 1000,
                PartNumberMarker: i * 1000
            };
            try {
                const data = await s3.listParts(listparam).promise();
                Array.prototype.push.apply(etags,data.Parts); 
            } catch (err) {
                Promise.reject(err);
            }
        }
        return etags;
    }

    private async complete(key,config?) {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;

        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        
        const uploadFileObject = this.uploadFiles.find(uploadFile => {
            if(uploadFile.Key === final_key){
                return uploadFile;
            }
        });
        const s3 = this._createS3(opt);
        const completedEtagList = await this.listparts(final_key, config);
        if(completedEtagList.length !== uploadFileObject.noOfParts){
            uploadFileObject.rej('file not uploaded');
        }
        dispatchStorageEvent(
            track,
            { method: 'put', result: 'success' },
            null);
        const Upload = {
            Bucket: bucket,
            Key: final_key,
            MultipartUpload: {
                Parts: uploadFileObject.eTags
            },
            UploadId: uploadFileObject.uploadId
        };
        
        await s3.completeMultipartUpload(Upload, (err, data) => {
            if (err) {
                
                uploadFileObject.rej(err);
            }
            else { 
                this.uploadFiles.forEach(element => {
                    if (element.Key === key) {
                
                        
                        this.uploadFiles.splice(this.uploadFiles.indexOf(element),1);    
                    }
                });
                uploadFileObject.res({key});
            }
        });
    }

    private async uploadMultiPart(final_key, progressCallback, config?) {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const s3 = this._createS3(opt);
        const uploadDetails = this.uploadFiles.find(uploadFile => {
            return uploadFile.Key === final_key;
        });
        if(uploadDetails === undefined){
            Promise.reject('upload not found');
        }
        const uploadId = uploadDetails.uploadId;
        const file = uploadDetails.file;
        const fileSize = uploadDetails.file.size;
        const noOfParts = uploadDetails.noOfParts;
        const reject = uploadDetails.rej;
        this.uploadFiles.forEach(uploadFile => {
            if(uploadFile.Key === final_key){
                uploadFile.status = 'uploading';
            }
        });
        const etags = uploadDetails.eTags;
        let partNo;
        if (etags.length !== 0) {
            partNo = etags.length + 1;
        } else {
            partNo = 1;
        }
        
        for (let i = partNo; i <= noOfParts; i++) {
            let filePart;
            const uploadFileObject = this.uploadFiles.find(uploadFile => {
                return uploadFile.Key === final_key;
            });
            
            if (uploadFileObject === undefined) {
                return Promise.reject('Upload does not exist');
            }
    
            if (uploadFileObject.status === 'uploading') {
                if (i !== noOfParts) {
                    filePart = file.slice(((i - 1) * AWSS3Provider.PART_SIZE + 1), 
                                          ( i * AWSS3Provider.PART_SIZE) + 1, file.contentType);

                } else {
                    if(fileSize > AWSS3Provider.PART_SIZE)
                        filePart = file.slice(((i - 1) * AWSS3Provider.PART_SIZE) + 1, fileSize, file.contentType);
                    else 
                        filePart = file;
                }
                
                const uploadParams = {
                    Body: filePart,
                    Bucket: bucket,
                    Key: final_key,
                    PartNumber: i,
                    UploadId: uploadId
                };
        
                try {            
                    const data = await s3.uploadPart(uploadParams).promise();
                    
                    if (progressCallback) {
                        if (typeof progressCallback === 'function') {
                            const progress = {
                                    loaded:i*AWSS3Provider.PART_SIZE,
                                    totale: fileSize,
                                    part:i,
                                    key:final_key
                                };
                                progressCallback(progress);
                        } else {
                        logger.warn('progressCallback should be a function, not a ' + typeof progressCallback);
                            }
                    }
                        
                    let eTag;
                    let tag = data.ETag;
                    tag = tag.replace(/\"/g, "");
                    const etagList = uploadFileObject.eTags;
            
                    if (etagList.length !== 0) {
                        const found = etagList.find((element) => {
                            return (element.PartNumber === i) ;
                        });
                        if (found === undefined){
                            etagList.push({ ETag: tag, PartNumber: i });
                        }
            
                        this.uploadFiles.forEach(uploadFile => {
                            if(uploadFile.Key === final_key){
                                uploadFile.eTags = etagList;
                            }
                        });
                    } else {
                        eTag = [{ ETag: tag, PartNumber: i }];
                        this.uploadFiles.forEach(uploadFile => {
                            if(uploadFile.Key === final_key){
                                uploadFile.eTags = eTag;
                            }
                        });
                    }
                    
                } catch (error) {
                    if (error.toString().includes('Network Failure')) {
                        this.uploadFiles.forEach(element => {
                            if (element.Key === final_key) {
                                element.externalPause = false;
                                this.pauseUpload(element.key,config);
                            }
                        });
                        
                    } else {
                        console.error(error);
                        reject(error);
                    }
                }
            } else if (uploadFileObject.status === 'paused') {
                break;
            } else if (uploadFileObject.status === 'cancelled') {
                this.uploadFiles.forEach(element => {
                    if (element.Key === final_key) {
                          this.uploadFiles.splice(this.uploadFiles.indexOf(element),1);    
                    }
                });
                break;
            }
        }
        const finalEtagList = this.uploadFiles.find(uploadFile => {
            if (uploadFile.Key === final_key) {
                  return uploadFile.eTags;
            }
        });
        if (finalEtagList.eTags.length === noOfParts) {
            this.complete(finalEtagList.key, config);
        }
    }

    public async pauseUpload(key, config?) {

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const pauseFileObject = this.uploadFiles.find(uploadFile => {
            if(uploadFile.Key === final_key){
                return uploadFile;
            }
        });
        if(pauseFileObject === undefined){
            return Promise.reject('Key not found, cannot pause');
        }
        if (pauseFileObject.status === 'uploading') {
            this.uploadFiles.forEach(uploadFile => {
                if(uploadFile.Key === final_key){
                    uploadFile.status = 'paused';
                }
            });
        } else if (pauseFileObject.status === 'paused') {
            logger.debug('upload already paused');
        } else {
            logger.debug('upload already cancelled');
        }
    }

    public async resumeUpload(key, config?) {

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        const final_key = prefix + key;

        if (key === '') {
            this.uploadFiles.forEach(uploadFile => {
                if (uploadFile.externalPause === false) {
                    this.uploadMultiPart(uploadFile.Key,uploadFile.progressCallback ,config);
                }
            });
        } else {
            const resumeFileObject = this.uploadFiles.find(uploadFile => {
                if(uploadFile.Key === final_key){
                    return uploadFile;
                }
            });
            if(resumeFileObject === undefined){
                return Promise.reject('No file found');
            }
            if(resumeFileObject.status === 'paused'){
                this.uploadFiles.forEach(uploadFile => {
                    if(uploadFile.Key === final_key){
                        uploadFile.status = 'uploading';
                    }
                });
            } 
            this.uploadMultiPart(resumeFileObject.Key, resumeFileObject.progressCallback ,config);
        }
    }



    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [config] - { level : private|protected|public }
     * @return - Promise resolves upon successful removal of the object
     */
    public async remove(key: string, config?): Promise<any> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._config, config, );
        const { bucket, region, credentials, level, track } = opt;

        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('remove ' + key + ' from ' + final_key);

        const params = {
            Bucket: bucket,
            Key: final_key
        };

        return new Promise<any>((res, rej) => {
            s3.deleteObject(params, (err, data) => {
                if (err) {
                    dispatchStorageEvent(
                        track,
                        { method: 'remove', result: 'failed' },
                        null);
                    rej(err);
                } else {
                    dispatchStorageEvent(
                        track,
                        { method: 'remove', result: 'success' },
                        null);
                    res(data);
                }
            });
        });
    }

    /**
     * List bucket objects relative to the level and prefix specified
     * @param {String} path - the path that contains objects
     * @param {Object} [config] - { level : private|protected|public }
     * @return - Promise resolves to list of keys for all objects in path
     */
    public async list(path, config?): Promise<any> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track } = opt;

        const prefix = this._prefix(opt);
        const final_path = prefix + path;
        const s3 = this._createS3(opt);
        logger.debug('list ' + path + ' from ' + final_path);

        const params = {
            Bucket: bucket,
            Prefix: final_path
        };

        return new Promise<any>((res, rej) => {
            s3.listObjects(params, (err, data) => {
                if (err) {
                    logger.warn('list error', err);
                    dispatchStorageEvent(
                        track,
                        { method: 'list', result: 'failed' },
                        null);
                    rej(err);
                } else {
                    const list = data.Contents.map(item => {
                        return {
                            key: item.Key.substr(prefix.length),
                            eTag: item.ETag,
                            lastModified: item.LastModified,
                            size: item.Size
                        };
                    });
                    dispatchStorageEvent(
                        track,
                        { method: 'list', result: 'success' },
                        null);
                    logger.debug('list', list);
                    res(list);
                }
            });
        });
    }

    /**
     * @private
     */
    _ensureCredentials() {
        return Credentials.get()
            .then(credentials => {
                if (!credentials) return false;
                const cred = Credentials.shear(credentials);
                logger.debug('set credentials for storage', cred);
                this._config.credentials = cred;
                return true;
            })
            .catch(err => {
                logger.warn('ensure credentials error', err);
                return false;
            });
    }

    /**
     * @private
     */
    private _prefix(config) {
        const { credentials, level } = config;

        const customPrefix = config.customPrefix || {};
        const identityId = config.identityId || credentials.identityId;
        const privatePath = (customPrefix.private !== undefined ? customPrefix.private : 'private/') + identityId + '/';
        const protectedPath = (customPrefix.protected !== undefined ?
            customPrefix.protected : 'protected/') + identityId + '/';
        const publicPath = customPrefix.public !== undefined ? customPrefix.public : 'public/';

        switch (level) {
            case 'private':
                return privatePath;
            case 'protected':
                return protectedPath;
            default:
                return publicPath;
        }
    }

    /**
     * @private
     */
    private _createS3(config) {
        const { bucket, region, credentials } = config;
        AWS.config.update({
            region,
            credentials
        });
        return new S3({
            apiVersion: '2006-03-01',
            params: { Bucket: bucket },
            region
        });
    }
}
