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
                    Cache.setItem(final_key,{uploadId:uploadId} );
                    console.log('the updated uploadID is ', uploadId, data.UploadId);
                    let display = Cache.getItem(final_key);
                    console.log('cached',display);
                    let fileSize = object.size;
                    let noOfParts :number;
                    if(fileSize <= AWSS3Provider.PART_SIZE){
                        noOfParts = 1;
                    } else {
                        noOfParts = fileSize/AWSS3Provider.PART_SIZE;
                    }
                    noOfParts = Math.ceil(noOfParts);
                    this.uploadFiles.push({Key:final_key, uploadId:uploadId, noOfParts:noOfParts, file:object, externalPause: true});
                    console.log('no of parts is', noOfParts);
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

    public async cancelUpload(key: string, config?){
        let uploadKeyCachedObject = Cache.getItem(key);
        let cancelParams = {
            Bucket: 'testpluggables3',
            Key: key,
            UploadId: uploadKeyCachedObject.uploadId
        }
        const s3 = this._createS3({bucket:'testpluggables3',region:'us-east-1'})
        s3.abortMultipartUpload(cancelParams, (err,data)=>{
            if(err){
                console.log(err);
            } else{
                //call listparts here to make sure parts is empty.
                console.log(data);
            }
        })
    }

    private async listparts(bucket, key,etag,uploadId,s3){
        let uploadDetails = this.uploadFiles.find(uploadFile => {
            return uploadFile.Key === key;
        })
        let noOfparts = uploadDetails.noOfParts;
        let etagList = [];
        for(let i = 0; i < Math.ceil(noOfparts/1000); i++){
            let listparam = {
                Bucket:bucket,
                Key: key,
                UploadId: uploadId,
                MaxParts: 1000,
                PartNumberMarker: i*1000
            }
            try{
                let data = await s3.listParts(listparam).promise();
                console.log('list info');
                console.log(data);
                etagList.push (data.Parts);
                
            } catch (err) {
                console.log(err);
            }    
        }
        console.log('list we got back ',etagList.length);
        console.log('list we cached hmm ',etag.length);
            this.complete(bucket, key,etag,uploadId,s3);
        
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
    
    private async uploadMultiPart  (uploadId,final_key, bucket, s3, object) {

        let noOfParts :number;
                    if(object.size <= AWSS3Provider.PART_SIZE){
                        noOfParts = 1;
                    } else {
                        noOfParts = object.size/AWSS3Provider.PART_SIZE;
                    }
                    noOfParts = Math.ceil(noOfParts);
        console.log('data being uploaded is', object);
        let fileSize = object.size;
        Cache.setItem(final_key,{uploadId:uploadId, status: 'uploading'} );
        let uploadNo = Cache.getItem(uploadId);
        console.log('this is set in cache for our upload', uploadNo);
        let partNo ;
        if(uploadNo !== null) {
            partNo = uploadNo.length+1;
        } else {
            Cache.setItem(uploadId, []);
            partNo = 1;
        }
        
        
        console.log('partno gotten is', partNo);
        let etag =[];
        for(let i=partNo;i<=noOfParts;i++){
            
            console.log('value of i is :', i);
            let filePart =0;
            let checkStatus = Cache.getItem(final_key);
            console.log('this is the status stored for next upload', checkStatus.status);
            if(checkStatus.status === 'uploading'){
                if(i != noOfParts){
                    filePart = object.slice((i-1)* AWSS3Provider.PART_SIZE +1, (i*AWSS3Provider.PART_SIZE)+1, object.contentType);
                    
                } else {
                    filePart = object.slice((i-1)* AWSS3Provider.PART_SIZE +1, fileSize,object.contentType);
                    console.log('we are slicing from ',(i-1)* AWSS3Provider.PART_SIZE +1);
                    console.log('we are slicing upto',fileSize);
                }
                
                let uploadParams = {
                    Body: filePart,
                    Bucket: bucket,
                    Key: final_key,
                    PartNumber: i,
                    UploadId: uploadId
                }
                console.log('uploading this part now huh', uploadParams);
                try {
                    const data = await s3.uploadPart(uploadParams).promise();
                    let etag;
                    console.log(data);
                    let tag = data.ETag;
                    tag = tag.replace(/\"/g, "");
                    // this has to go in the cache each time.
                    let etagList = Cache.getItem(uploadId);
                    console.log('caches etags before are', etagList);
                    if( etagList.length !== 0){
                        console.log('this is what it looks like in cache',etagList );
                        let etag1 = etagList; 
                        console.log('the list of etags now:', etag1);
                        etag1.push ( {ETag: tag, PartNumber: i});
                        Cache.setItem(uploadId,etag1);

                    } else {
                        etag = [{ETag: tag, PartNumber: i}];
                        Cache.setItem(uploadId,etag);
                        
                    }
                    
    
                    console.log('Etag array is now :',etag);
                    Cache.getItem(final_key);
                } catch (error) {
                    console.log('caugh error', error);
                    if(error.toString().includes('Network Failure')) {
                        console.log('and breaking her@');
                        this.uploadFiles.forEach(element => {
                            if(element.Key === final_key){
                                element.externalPause = false;
                            }
                        })
                        this.pauseUpload(final_key);
                    }
                    console.error(error);
                    //call pause here if network error.
                    //i--;
                }
            } else if(checkStatus.status === 'paused'){
                console.log('well we came here but didnt break');
                break;
            }
        }
        
        if(Cache.getItem(uploadId).length === noOfParts ){
            let listPartsParam = Cache.getItem(uploadId);
            console.log('these are our params:', listPartsParam);
            this.listparts(bucket, final_key,listPartsParam,uploadId,s3);  
        }
        

    }

    public async pauseUpload(final_key, config?){
        let uploadKeyCachedObject = Cache.getItem(final_key);
        
        if(uploadKeyCachedObject.status === 'uploading') {
            let uploadId = uploadKeyCachedObject.uploadId
            Cache.setItem(final_key, { uploadId: uploadId, status: 'paused'});
            let status = Cache.getItem(final_key).status;
            console.log('after pause this is on cache', status);
        }
    }

    public async resumeUpload(final_key, config?) {
        if(final_key === ''){
            //do things to resume all the uploads. I'm sure we can add this now too.
             this.uploadFiles.forEach(element => {
                 if(element.externalPause === false){
                    console.log('reviving key', element.Key);
                    let s3 = this._createS3(this._config);
                    this.uploadMultiPart(element.uploadId,element.Key, 'testpluggables3', s3, element.file);                   
                 }
             });
        } else {
            let uploadKeyCachedObject = Cache.getItem(final_key);
            
            if(uploadKeyCachedObject.status === 'paused') {
                let uploadId = uploadKeyCachedObject.uploadId
                Cache.setItem(final_key, { uploadId: uploadId, status: 'uploading'});
            }
            let s3 = this._createS3(this._config);
            let uploadDetails = this.uploadFiles.find(uploadFile => {
                return uploadFile.Key === final_key;
            })
            this.uploadMultiPart(uploadDetails.uploadId,uploadDetails.Key, 'testpluggables3', s3, uploadDetails.file );
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
