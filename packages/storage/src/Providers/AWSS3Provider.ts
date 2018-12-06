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
import { ALL_UPLOADS } from '../index';
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
    static PART_SIZE = 5242880; // 1024*1024*5
    static INITIATED = 'initiated';
    static PAUSED = 'paused';
    static UPLOADING = 'uploading';
    static CANCELLED = 'cancelled';

    /**
     * @private
     */
    private _config;
    private currentUploadingFiles = {};

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
        console.log('configure started for provider');
        if (!config) return this._config;
        console.log('sent to parser this', config);
        const amplifyConfig = Parser.parseMobilehubConfig(config);
        console.log('parsed amplifyConfig is', amplifyConfig);
        this._config = Object.assign({}, this._config, amplifyConfig.Storage, config);
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
        const s3Key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('get ' + key + ' from ' + s3Key);

        const params: any = {
            Bucket: bucket,
            Key: s3Key
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
        const s3Key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('put ' + key + ' to ' + s3Key);

        try {
            const createMultipartParams:any = {
                Bucket: bucket,
                Key: s3Key
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
            if(this.currentUploadingFiles[s3Key]){
                Promise.reject('File is already uploading');
            }
            return new Promise((res, rej) => {
                s3.createMultipartUpload(createMultipartParams, (err, data) => {
                    if (err) {
                        logger.debug('Upload error', err);
                        rej(err);
                    } else {
                        uploadId = data.UploadId;
                        const fileSize = (typeof(object) === 'string')? 
                            encodeURI(object).split(/%..|./).length - 1: object.size;
                        const noOfParts = (fileSize <= AWSS3Provider.PART_SIZE) ? 1
                            : Math.ceil(fileSize / AWSS3Provider.PART_SIZE);

                        this.currentUploadingFiles[s3Key] = 
                            {key, 
                            uploadId, 
                            noOfParts, 
                            'file': object,
                            'fileSize':fileSize, 
                            'externalPause': true, 
                            'resolveCallback':res,
                            'rejectCallback':rej,
                            'status': AWSS3Provider.INITIATED,
                            'eTags': [],
                            progressCallback,
                            config};
                        this.uploadMultiPart(s3Key, config);
                    }
                });
            });

            } catch (e) {
                logger.warn("error uploading", e);
                dispatchStorageEvent(
                    track,
                    { method: 'put', result: 'failed' },
                    null);

                Promise.reject(e);
            }
        }

    
    public async cancelUpload(key: string, config?): Promise<any> {

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        const s3Key = prefix + key;
        const cancelFileObject = this.currentUploadingFiles[s3Key];
       
        if (!cancelFileObject) {
            Promise.reject('Upload not found in cache');
        }
        const cancelParams = {
            Bucket: bucket,
            Key: s3Key,
            UploadId: cancelFileObject.uploadId
        };
        
        const s3 = this._createS3(opt);
        let etags;
        try {
            const data = await s3.abortMultipartUpload(cancelParams).promise();
        
            // call listparts here to make sure parts is empty.
            cancelFileObject.status = AWSS3Provider.CANCELLED;
            // call listparts to ensure etags are empty
            etags = await this.listparts(s3Key,config);
            
            if(etags.length !== 0){
                    Promise.reject('Error cancelling your upload');
            }
            // remove from object
            delete this.currentUploadingFiles[s3Key]; 
            
            Promise.resolve('Upload cancelled');
        } catch(error){
            Promise.reject(error);
        }
    }

    private async listparts(s3Key, config?) {
    
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const s3 = this._createS3(opt);
        const listFileObject = this.currentUploadingFiles[s3Key];
        if(!listFileObject){
            Promise.reject('No file found');
        }
        const noOfparts = listFileObject.noOfParts;
        const etags = [];
        for (let i = 0; i < Math.ceil(noOfparts / 1000); i++) {
            const listparam = {
                Bucket: bucket,
                Key: s3Key,
                UploadId: listFileObject.uploadId,
                MaxParts: 1000,
                PartNumberMarker: i * 1000
            };
            try {
                const data = await s3.listParts(listparam).promise();
                Array.prototype.push.apply(etags,data.Parts);
            } catch (err) {
                if (err.toString().includes('Network Failure') &&
                this.currentUploadingFiles[s3Key].status !== AWSS3Provider.PAUSED) {
                    this.currentUploadingFiles[s3Key].externalPause = false;
                    await this.pauseUpload(s3Key,config);
                } else {
                    logger.debug('upload rejected', err);
                    Promise.reject(err);
                }
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
        const s3Key = prefix + key; 
        const uploadFileObject = this.currentUploadingFiles[s3Key];
        const s3 = this._createS3(opt);
        const completedEtagList = await this.listparts(s3Key, config);
        if(completedEtagList.length !== uploadFileObject.noOfParts){
            uploadFileObject.rej('file not uploaded');
        }

        const Upload = {
            Bucket: bucket,
            Key: s3Key,
            MultipartUpload: {
                Parts: uploadFileObject.eTags
            },
            UploadId: uploadFileObject.uploadId
        };
        
        await s3.completeMultipartUpload(Upload, (err, data) => {
            if (err) {
                if (err.toString().includes('Network Failure')&&
                this.currentUploadingFiles[s3Key].status !== AWSS3Provider.PAUSED) {
                    uploadFileObject.externalPause = false;
                    this.pauseUpload(uploadFileObject.key,config);
                    
                } else {
                    logger.debug('upload rejected', err);
                    uploadFileObject.rejectCallback(err);
                }
            }
            else {
                dispatchStorageEvent(
                    track,
                    { method: 'put', result: 'success' },
                    null);
                delete this.currentUploadingFiles[s3Key];
                uploadFileObject.resolveCallback({key});
            }
        });
    }

    private async uploadMultiPart(s3Key, config?) {
        let credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const uploadFileObject = this.currentUploadingFiles[s3Key];
        if(!uploadFileObject){
            Promise.reject('upload not found');
        }
        const {uploadId,file,noOfParts, rejectCallback,progressCallback,fileSize ,eTags} = uploadFileObject;
        uploadFileObject.status = AWSS3Provider.UPLOADING;
        const partNo = eTags.length + 1;
        for (let i = partNo; i <= noOfParts; i++) {
            let filePart;
            if (!uploadFileObject) {
                return rejectCallback('Upload does not exist');
            }
            if (uploadFileObject.status === AWSS3Provider.UPLOADING) {
                if(fileSize > AWSS3Provider.PART_SIZE) {
                    if (i !== noOfParts) {
                        filePart = file.slice(((i - 1) * AWSS3Provider.PART_SIZE ), 
                                              ( i * AWSS3Provider.PART_SIZE), file.contentType);
    
                    } else {
                        filePart = file.slice(((i - 1) * AWSS3Provider.PART_SIZE), fileSize, file.contentType);
                    }
                } else {
                    filePart = file;
                }
                
                const currentUploadParams = {
                    Body: filePart,
                    Bucket: bucket,
                    Key: s3Key,
                    PartNumber: i,
                    UploadId: uploadId
                };
        
                try { 
                    credentialsOK = await this._ensureCredentials();
                    if (!credentialsOK) { rejectCallback('No credentials'); }  
                    const s3 = this._createS3(opt);
                    let { ETag } = await  s3.uploadPart(currentUploadParams).on('httpUploadProgress', progress =>{
                        if (progressCallback) {
                            if (typeof progressCallback === 'function') {
                                progressCallback(progress);
                            } else {
                                logger.warn('progressCallback should be a function, not a ' + typeof progressCallback);
                            }
                        }
                    }).promise();
                        
                    ETag = ETag.replace(/\"/g, "");
                    // const etagList = uploadFileObject.eTags; 
                    
                    if (eTags.length !== 0) {
                        const found = eTags.find((element) => {
                            return (element.PartNumber === i) ;
                        });
                        if (!found){
                            eTags.push({ ETag, PartNumber: i });
                        }
                        uploadFileObject.eTags = eTags;
                    } else {
                        uploadFileObject.eTags = [{ ETag, PartNumber: i }];    
                    }
                } catch (error) {
                    if (error.toString().includes('Network Failure')&&
                    this.currentUploadingFiles[s3Key].status !== AWSS3Provider.PAUSED) {
                        uploadFileObject.externalPause = false;
                        await this.pauseUpload(uploadFileObject.key,config);
                        
                    } else {
                        logger.debug('upload rejected', error);
                        rejectCallback(error);
                    }
                }
            } else if (uploadFileObject.status === AWSS3Provider.PAUSED) {
                break;
            } else if (uploadFileObject.status === AWSS3Provider.CANCELLED) {
                delete(this.currentUploadingFiles[s3Key]);
                break;
            }
        }
        if(this.currentUploadingFiles[s3Key]) {
            const finalEtagList = this.currentUploadingFiles[s3Key];
            if (finalEtagList.eTags.length === noOfParts) {
                this.complete(finalEtagList.key, config);
            }
        }
        
    }

    public async pauseUpload(key, config?):Promise<any> {

        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        const s3Key = prefix + key;
        const pauseFileObject = this.currentUploadingFiles[s3Key];
        if(!pauseFileObject){
            return Promise.reject('Key not found, cannot pause');
        }
        if (pauseFileObject.status === AWSS3Provider.UPLOADING 
            || pauseFileObject.status === AWSS3Provider.INITIATED) {
            pauseFileObject.status = AWSS3Provider.PAUSED;
        } else if (pauseFileObject.status === AWSS3Provider.PAUSED) {
            logger.debug('upload already paused');
        } else if(pauseFileObject.status === AWSS3Provider.CANCELLED){
            logger.debug('upload already cancelled');
        }
        logger.debug('upload paused for key', key);
        Promise.resolve('Upload paused');
    }

    public async resumeUpload(key: string|Symbol, config?) {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }
        const opt = Object.assign({}, this._config, config);
        const { bucket, region, credentials, level, download, track, expires } = opt;
        const prefix = this._prefix(opt);
        

        if (key === ALL_UPLOADS) {
            for(const Key in this.currentUploadingFiles){
                this.uploadMultiPart(Key,this.currentUploadingFiles[Key].config);
            }
        } else {
            const s3Key = prefix + key;
            const resumeFileObject = this.currentUploadingFiles[s3Key];
            if(!resumeFileObject){
                return Promise.reject('No file found');
            }
            if(resumeFileObject.status === AWSS3Provider.PAUSED){
                resumeFileObject.status = AWSS3Provider.UPLOADING;
            } 
            this.uploadMultiPart(s3Key, config);
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
        const s3Key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('remove ' + key + ' from ' + s3Key);

        const params = {
            Bucket: bucket,
            Key: s3Key
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
