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
import Cache from '@aws-amplify/cache';

const logger = new Logger('AWSS3Provider');

const dispatchStorageEvent = (track, attrs, metrics) => {
    if (track) {
        Hub.dispatch('storage', { attrs, metrics }, 'Storage');
    }
};

/**
 * Provide storage methods to use AWS S3
 */
export default class AWSS3Provider implements StorageProvider{
    
    static CATEGORY = 'Storage';
    static PROVIDER_NAME = 'AWSS3';
    static PART_SIZE = 5;
    
    /**
     * @private
     */
    private _config;
    
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
        const type = contentType ? contentType : 'binary/octet-stream';

        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('put ' + key + ' to ' + final_key);

        const params: any = {
            Bucket: 'testpluggables3',
            Key: final_key,
            Body: object,
            ContentType: type
        };
        if (cacheControl) { params.CacheControl = cacheControl; }
        if (contentDisposition) { params.ContentDisposition = contentDisposition; }
        if (expires) { params.Expires = expires; }
        if (metadata) { params.Metadata = metadata; }

        try {
           
            console.log('starting upload');
            let createMultipartParams = {
                Bucket: 'testpluggables3',
                Key: final_key
            }
            let uploadId ;
             s3.createMultipartUpload(createMultipartParams, (err, data) =>{
                if(err) {
                    console.log(err);
                    logger.debug('Upload error',err);
                    Promise.reject(err);
                } else { 
                    uploadId = data.UploadId;
                    console.log('initiate upload');
                    console.log(data);
                    Cache.setItem(final_key,uploadId );
                    console.log('the updated uploadID is ', uploadId, data.UploadId);
                    let display = Cache.getItem(final_key);
                    console.log('cached',display);
                    this.uploadMultiPart(uploadId,final_key, 'testpluggables3', s3, object);
                }    

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

    

    private async listparts(bucket, key,etag,uploadId,s3){
        let listparam = {
            Bucket:bucket,
            Key: key,
            UploadId: uploadId
        }
        try{
            let data = await s3.listParts(listparam).promise();
            console.log('list info');
            console.log(data);
            this.complete(bucket, key,etag,uploadId,s3);
        } catch (err) {
            console.log(err);
        }
    }

    private async complete(bucket, key,etag,uploadId,s3){
        console.log('values of each',etag);
        let Upload = {
            Bucket: bucket,
            Key: key,
            MultipartUpload:{
                Parts:etag
            },
            UploadId:uploadId 
        };
        console.log('upload object looks like this', Upload);
        await s3.completeMultipartUpload(Upload, (err,data)=>{
            if(err)console.log(err);

            else {
                console.log('complete info');
                console.log(data);
            }
        })
    }
    
    private uploadMultiPart = async(uploadId,final_key, bucket, s3, object) => {
        console.log('data being uploaded is', object);
        let fileSize = object.size;
        let noOfParts :number;
        if(fileSize <= 5000000){
            noOfParts = 1;
        } else {
            noOfParts = fileSize/5000000;
        }
        noOfParts = Math.ceil(noOfParts);
        console.log('no of parts is', noOfParts);
        Cache.setItem(uploadId, '{}')
        //let i;
        let etag = [];
        
        for(let i=1;i<=noOfParts;i++){
            
            console.log('value of i is :', i);
            let filePart =0;
            if(i != noOfParts){
                filePart = object.slice((i-1)* 5242880 +1, (i*5242880)+1, object.contentType);
                
            } else {
                filePart = object.slice((i-1)* 5242880 +1, fileSize,object.contentType);
                console.log('we are slicing from ',(i-1)* 5242880 +1);
                console.log('we are slicing upto',fileSize);
            }
            
            let uploadParams = {
                Body: filePart,
                Bucket: bucket,
                Key: final_key,
                PartNumber: i,
                UploadId: uploadId
            }
            console.log('uploading this part now', uploadParams);
            try {
                const data = await s3.uploadPart(uploadParams).promise();
                
                console.log(data);
                let tag = data.ETag;
                tag = tag.replace(/\"/g, "");
                // this has to go in the cache each time.
                
                etag.push({ETag: tag, PartNumber: i});
                Cache.setItem(final_key,etag);
                
                console.log('Etag array is now :',etag);
                Cache.getItem(final_key);
            } catch (error) {
                if(error.name === 'Network Error')
                console.error(error);
                this.pauseUpload(final_key);
                //i--;
            }
        }
        this.listparts(bucket, final_key,etag,uploadId,s3);  

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
