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
import AWSS3Provider from './Providers/AWSS3Provider';
import { StorageOptions, StorageProvider } from './types';

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
    private _config;
    private _pluggables: StorageProvider[];

    /**
     * Initialize Storage with AWS configurations
     * @param {Object} config - Configuration object for storage
     */
    constructor() {
        this._config = {};
        this._pluggables = [];
        logger.debug('Storage Options', this._config);

        this.get = this.get.bind(this);
        this.put = this.put.bind(this);
        this.remove = this.remove.bind(this);
        this.list = this.list.bind(this);
    }

    public getModuleName() {
        return 'Storage';
    }

    /**
     * add plugin into Analytics category
     * @param {Object} pluggable - an instance of the plugin
     */
    public addPluggable(pluggable: StorageProvider) {
        if (pluggable && pluggable.getCategory() === 'Storage') {
            this._pluggables.push(pluggable);
            let config = {};
            // for backward compatibility
            if (pluggable.getProviderName() === 'AWSS3' && !this._config['AWSS3']) {
                config = pluggable.configure(this._config);  
            } else {
                config = pluggable.configure(this._config[pluggable.getProviderName()]);
            }
            return config;
        }
    }

    /**
     * Get the plugin object
     * @param providerName - the name of the plugin 
     */
    public getPluggable(providerName) {
        for (let i = 0; i < this._pluggables.length; i += 1) {
            const pluggable = this._pluggables[i];
            if (pluggable.getProviderName() === providerName) {
                return pluggable;
            }
        }
      
        logger.debug('No plugin found with providerName', providerName);
        return null;
    }

    /**
     * Remove the plugin object
     * @param providerName - the name of the plugin
     */
    public removePluggable(providerName) {
        let idx = 0;
        while (idx < this._pluggables.length) {
            if (this._pluggables[idx].getProviderName() === providerName) {
                break;
            }
            idx += 1;
        }

        if (idx === this._pluggables.length) {
            logger.debug('No plugin found with providerName', providerName);
            return;
        } else {
            this._pluggables.splice(idx, idx + 1);
            return;
        }
    }

    /**
     * Configure Storage part with aws configuration
     * @param {Object} config - Configuration of the Storage
     * @return {Object} - Current configuration
     */
    configure(config?) {
        logger.debug('configure Storage');
        if (!config) return this._config;
        let opt = config ? config.Storage || config : {};

        if (config['aws_user_files_s3_bucket']) {
            opt = {
                bucket: config['aws_user_files_s3_bucket'],
                region: config['aws_user_files_s3_bucket_region']
            };
        }
        this._config = Object.assign({}, this._config, opt);
        if (!this._config.bucket) { logger.debug('Do not have bucket yet'); }
        
        this._pluggables.forEach((pluggable) => {
            // for backward compatibility
            if (pluggable.getProviderName() === 'AWSS3' && !this._config['AWSS3']) {
                pluggable.configure(this._config);  
            } else {
                pluggable.configure(this._config[pluggable.getProviderName()]);
            }
        });

        if (this._pluggables.length === 0) {
            this.addPluggable(new AWSS3Provider());
        }


        return this._config;
    }

    private _get(key: string, config?) {
        const provider = config.provider? config.provider: 'AWSS3';
        
        this._pluggables.forEach((pluggable) => {
            if (pluggable.getProviderName() === provider) {
                if(config){
                    pluggable.get(key,config);
                } else {
                    pluggable.get(key);
                }
            }
        });
        // return Promise.resolve();
    }
    /**
    * Get a presigned URL of the file or the object data when download:true
    *
    * @param {String} key - key of the object
    * @param {Object} [config] - { level : private|protected|public, download: true|false }
    * @return - A promise resolves to Amazon S3 presigned URL on success
    */
    public async get(key: string, config?) {
        return this._get(key, config);
    }

    private _put(key: string, object, config?) {
        const provider = config.provider? config.provider: 'AWSS3';
        
        this._pluggables.forEach((pluggable) => {
            if (pluggable.getProviderName() === provider) {
                if(config){
                    pluggable.put(key,object,config);
                } else {
                    pluggable.put(key, object);
                }
            }
        });
        // return Promise.resolve();
    }

    /**
     * Put a file in S3 bucket specified to configure method
     * @param {Stirng} key - key of the object
     * @param {Object} object - File to be put in Amazon S3 bucket
     * @param {Object} [config] - { level : private|protected|public, contentType: MIME Types,
     *  progressCallback: function }
     * @return - promise resolves to object on success
     */
    public async put(key: string, object, config?) {
        return this._put(key, object, config);
        
    }

    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [config] - { level : private|protected|public }
     * @return - Promise resolves upon successful removal of the object
     */
    public async remove(key: string, config?): Promise<any> {
        return this._remove(key, config);
    }

    private _remove(key, config){
        const provider = config.provider? config.provider: 'AWSS3';
        
        this._pluggables.forEach((pluggable) => {
            if (pluggable.getProviderName() === provider) {
                if(config){
                    pluggable.remove(key,config);
                } else {
                    pluggable.remove(key);
                }
            }
        });
    }

    private _list(path, config) {
        const provider = config.provider? config.provider: 'AWSS3';
        
        this._pluggables.forEach((pluggable) => {
            if (pluggable.getProviderName() === provider) {
                if(config){
                    pluggable.list(path,config);
                } else {
                    pluggable.list(path);
                }
            }
        });
    }

    /**
     * List bucket objects relative to the level and prefix specified
     * @param {String} path - the path that contains objects
     * @param {Object} [config] - { level : private|protected|public }
     * @return - Promise resolves to list of keys for all objects in path
     */
    public async list(path, config?): Promise<any> {
        return this._list(path, config);
    }

    // /**
    //  * @private
    //  */
    // _ensureCredentials() {
    //     // commented
    //     // will cause bug if another user logged in without refreshing page
    //     // if (this._config.credentials) { return Promise.resolve(true); }

    //     return Credentials.get()
    //         .then(credentials => {
    //             if (!credentials) return false;
    //             const cred = Credentials.shear(credentials);
    //             logger.debug('set credentials for storage', cred);
    //             this._config.credentials = cred;

    //             return true;
    //         })
    //         .catch(err => {
    //             logger.warn('ensure credentials error', err);
    //             return false;
    //         });
    // }

    // /**
    //  * @private
    //  */
    // private _prefix(config) {
    //     const { credentials, level } = config;

    //     const customPrefix = config.customPrefix || {};
    //     const identityId = config.identityId || credentials.identityId;
    //     const privatePath = (customPrefix.private !== undefined ?
    // customPrefix.private : 'private/') + identityId + '/';
    //     const protectedPath = (customPrefix.protected !== undefined ?
    //         customPrefix.protected : 'protected/') + identityId + '/';
    //     const publicPath = customPrefix.public !== undefined ? customPrefix.public : 'public/';

    //     switch (level) {
    //         case 'private':
    //             return privatePath;
    //         case 'protected':
    //             return protectedPath;
    //         default:
    //             return publicPath;
    //     }
    // }

    // /**
    //  * @private
    //  */
    // private _createS3(config) {
    //     const { bucket, region, credentials } = config;
    //     AWS.config.update({
    //         region,
    //         credentials
    //     });
    //     return new S3({
    //         apiVersion: '2006-03-01',
    //         params: { Bucket: bucket },
    //         region
    //     });
    // }
}
