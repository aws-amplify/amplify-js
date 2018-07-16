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
    Credentials
} from '@aws-amplify/core';
import * as S3 from 'aws-sdk/clients/s3';
import { StorageOptions } from './types';

const logger = new Logger('StorageClass');

const dispatchStorageEvent = (track, attrs, metrics) => {
    if (track) {
        Hub.dispatch('storage', { attrs, metrics }, 'Storage');
    }
};

/**
 * Provide storage methods to use AWS S3
 */
export default class StorageClass {
    /**
     * @private
     */
    private _options;

    /**
     * @public
     */
    public vault: StorageClass;

    /**
     * Initialize Storage with AWS configurations
     * @param {Object} options - Configuration object for storage
     */
    constructor(options: StorageOptions) {
        this._options = options;
        logger.debug('Storage Options', this._options);
    }

    public getModuleName() {
        return 'Storage';
    }

    /**
     * Configure Storage part with aws configuration
     * @param {Object} config - Configuration of the Storage
     * @return {Object} - Current configuration
     */
    configure(options?) {
        logger.debug('configure Storage');
        let opt = options ? options.Storage || options : {};

        if (options['aws_user_files_s3_bucket']) {
            opt = {
                bucket: options['aws_user_files_s3_bucket'],
                region: options['aws_user_files_s3_bucket_region']
            };
        }
        this._options = Object.assign({}, this._options, opt);
        if (!this._options.bucket) { logger.debug('Do not have bucket yet'); }

        return this._options;
    }

    /**
    * Get a presigned URL of the file
    * @param {String} key - key of the object
    * @param {Object} [options] - { level : private|protected|public }
    * @return - A promise resolves to Amazon S3 presigned URL on success
    */
    public async get(key: string, options?): Promise<Object> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._options, options);
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
     * @param {Object} [options] - { level : private|protected|public, contentType: MIME Types }
     * @return - promise resolves to object on success
     */
    public async put(key: string, object, options?): Promise<Object> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._options, options);
        const { bucket, region, credentials, level, track } = opt;
        const { contentType, contentDisposition, cacheControl, expires, metadata } = opt;
        const type = contentType ? contentType : 'binary/octet-stream';

        const prefix = this._prefix(opt);
        const final_key = prefix + key;
        const s3 = this._createS3(opt);
        logger.debug('put ' + key + ' to ' + final_key);

        const params: any = {
            Bucket: bucket,
            Key: final_key,
            Body: object,
            ContentType: type
        };
        if (cacheControl) { params.CacheControl = cacheControl; }
        if (contentDisposition) { params.ContentDisposition = contentDisposition; }
        if (expires) { params.Expires = expires; }
        if (metadata) { params.Metadata = metadata; }

        return new Promise<Object>((res, rej) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    logger.warn("error uploading", err);
                    dispatchStorageEvent(
                        track,
                        { method: 'put', result: 'failed' },
                        null);
                    rej(err);
                } else {
                    logger.debug('upload result', data);
                    dispatchStorageEvent(
                        track,
                        { method: 'put', result: 'success' },
                        null);
                    res({
                        key: data.Key.substr(prefix.length)
                    });
                }
            });
        });
    }

    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [options] - { level : private|protected|public }
     * @return - Promise resolves upon successful removal of the object
     */
    public async remove(key: string, options?): Promise<any> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._options, options, );
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
     * @param {Object} [options] - { level : private|protected|public }
     * @return - Promise resolves to list of keys for all objects in path
     */
    public async list(path, options?): Promise<any> {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._options, options);
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
        // commented
        // will cause bug if another user logged in without refreshing page
        // if (this._options.credentials) { return Promise.resolve(true); }

        return Credentials.get()
            .then(credentials => {
                if (!credentials) return false;
                const cred = Credentials.shear(credentials);
                logger.debug('set credentials for storage', cred);
                this._options.credentials = cred;

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
    private _prefix(options) {
        const { credentials, level } = options;

        const customPrefix = options.customPrefix || {};
        const identityId = options.identityId || credentials.identityId;
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
    private _createS3(options) {
        const { bucket, region, credentials } = options;
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
