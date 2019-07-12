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

import { ConsoleLogger as Logger, Parser } from '@aws-amplify/core';
import AWSS3Provider from './Providers/AWSS3Provider';
import { StorageProvider } from './types';

const logger = new Logger('StorageClass');

const DEFAULT_PROVIDER = 'AWSS3';
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
     * @public
     */
    public vault: StorageClass;

    /**
     * Initialize Storage
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
     * add plugin into Storage category
     * @param {Object} pluggable - an instance of the plugin
     */
    public addPluggable(pluggable: StorageProvider) {
        if (pluggable && pluggable.getCategory() === 'Storage') {
            this._pluggables.push(pluggable);
            let config = {};
            
            config = pluggable.configure(this._config[pluggable.getProviderName()]);
            
            return config;
        }
    }

    /**
     * Get the plugin object
     * @param providerName - the name of the plugin
     */
    public getPluggable(providerName: string) {
        const pluggable = this._pluggables.find(pluggable => pluggable.getProviderName() === providerName);
        if (pluggable === undefined) {
            logger.debug('No plugin found with providerName', providerName);
            return null;
        } else
            return pluggable;
    }

    /**
     * Remove the plugin object
     * @param providerName - the name of the plugin
     */
    public removePluggable(providerName: string) {
        this._pluggables = this._pluggables.filter(pluggable => pluggable.getProviderName() !== providerName);
        return;
    }

    /**
     * Configure Storage
     * @param {Object} config - Configuration object for storage
     * @return {Object} - Current configuration
     */
    configure(config?) {
        logger.debug('configure Storage');
        if (!config) return this._config;

        const amplifyConfig = Parser.parseMobilehubConfig(config);

        const storageKeysFromConfig = Object.keys(amplifyConfig.Storage);

        const storageArrayKeys = [
            'bucket',
            'region',
            'level',
            'track',
            'customPrefix',
            'serverSideEncryption',
            'SSECustomerAlgorithm',
            'SSECustomerKey',
            'SSECustomerKeyMD5',
            'SSEKMSKeyId'
        ];

        const isInStorageArrayKeys = (k: string) => storageArrayKeys.some(x => x === k);
        const checkConfigKeysFromArray = (k: string[]) => k.find(k => isInStorageArrayKeys(k));
        const isDefinedNonObject = (v: any) => typeof v !== 'object' && v !== undefined;

        if (
            storageKeysFromConfig &&
            checkConfigKeysFromArray(storageKeysFromConfig) &&
            !amplifyConfig.Storage[DEFAULT_PROVIDER]
        ) {
            amplifyConfig.Storage[DEFAULT_PROVIDER] = {};
        }

        Object.entries(amplifyConfig.Storage).map(([key, value]) => {
            if (key && isInStorageArrayKeys(key) && isDefinedNonObject(value)) {
                amplifyConfig.Storage[DEFAULT_PROVIDER][key] = value;
                delete amplifyConfig.Storage[key];
            }
        });

        // only update new values for each provider
        Object.keys(amplifyConfig.Storage).forEach((providerName) => {
            if (typeof amplifyConfig.Storage[providerName] !== 'string') {
                this._config[providerName] = { ...this._config[providerName], ...amplifyConfig.Storage[providerName] };
            }
        });

        this._pluggables.forEach((pluggable) => {
            pluggable.configure(this._config[pluggable.getProviderName()]);
        });

        if (this._pluggables.length === 0) {
            this.addPluggable(new AWSS3Provider());
        }

        return this._config;
    }

    /**
    * Get a presigned URL of the file or the object data when download:true
    *
    * @param {String} key - key of the object
    * @param {Object} [config] - { level : private|protected|public, download: true|false }
    * @return - A promise resolves to either a presigned url or the object
    */
    public async get(key: string, config?): Promise<String | Object> {

        const { provider = DEFAULT_PROVIDER } = config || {};
        const prov = this._pluggables.find(pluggable => pluggable.getProviderName() === provider);
        if (prov === undefined) {
            logger.debug('No plugin found with providerName', provider);
            Promise.reject('No plugin found in Storage for the provider');
        }
        return prov.get(key, config);
    }

    /**
     * Put a file in storage bucket specified to configure method
     * @param {String} key - key of the object
     * @param {Object} object - File to be put in bucket
     * @param {Object} [config] - { level : private|protected|public, contentType: MIME Types,
     *  progressCallback: function }
     * @return - promise resolves to object on success
     */
    public async put(key: string, object, config?): Promise<Object> {
        const { provider = DEFAULT_PROVIDER } = config || {};
        const prov = this._pluggables.find(pluggable => pluggable.getProviderName() === provider);
        if (prov === undefined) {
            logger.debug('No plugin found with providerName', provider);
            Promise.reject('No plugin found in Storage for the provider');
        }
        return prov.put(key, object, config);
    }

    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [config] - { level : private|protected|public }
     * @return - Promise resolves upon successful removal of the object
     */
    public async remove(key: string, config?): Promise<any> {
        const { provider = DEFAULT_PROVIDER } = config || {};
        const prov = this._pluggables.find(pluggable => pluggable.getProviderName() === provider);
        if (prov === undefined) {
            logger.debug('No plugin found with providerName', provider);
            Promise.reject('No plugin found in Storage for the provider');
        }
        return prov.remove(key, config);
    }

    /**
     * List bucket objects relative to the level and prefix specified
     * @param {String} path - the path that contains objects
     * @param {Object} [config] - { level : private|protected|public }
     * @return - Promise resolves to list of keys for all objects in path
     */
    public async list(path, config?): Promise<any> {
        const { provider = DEFAULT_PROVIDER } = config || {};
        const prov = this._pluggables.find(pluggable => pluggable.getProviderName() === provider);
        if (prov === undefined) {
            logger.debug('No plugin found with providerName', provider);
            Promise.reject('No plugin found in Storage for the provider');
        }
        return prov.list(path, config);
    }
}
