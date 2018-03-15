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
import CognitoCredentials from './Providers/CognitoCredentials';
import {
    ConsoleLogger as Logger,
    Parser
} from '../Common';
import { CredentialsProvider } from './types';

const logger = new Logger('Auth');

export default class Credentials{
    private _config;
    private _pluggables: CredentialsProvider[];

    constructor() {
        this._config = {};
        this._pluggables = [];
        this.addPluggable(new CognitoCredentials());
    }

    /**
     * Configure
     * @param {Object} config - the configuration
     */
    async configure(config) {
        logger.debug('configure Credentials');
        const conf = Object.assign({}, this._config, Parser.parseMobilehubConfig(config).Credentials);

        this._config = conf;
        logger.debug('credentials config', this._config);
        this._pluggables.map((pluggable) => {
            pluggable.configure(conf);
        });

        return this._config;
    }

    /**
     * Add pluggables to Credentials category
     * @param {Object} pluggable - plugin
     */
    public addPluggable(pluggable) {
        if (pluggable) {
            this._pluggables.push(pluggable);
            const config = pluggable.configure(this._config);
            return config;
        }
    }

    /**
     * Set credentials with configuration
     * @param {Object} config - the configuration
     */
    public setCredentials(config?) {
        let providerName = 'AWSCognito';
        if (config && config.providerName) providerName = config.providerName;

        return new Promise((res, rej) => {
            this._pluggables.map((pluggable) => {
                if (pluggable.getProviderName() === providerName) {
                    pluggable.setCredentials(config)
                        .then(cred => {
                            res(cred);
                        }).catch(e => {
                            rej('set credentials failed: ' + e);
                        });
                } else {
                    logger.debug('no provider found');
                    res(null);
                }
            });
        });
    }

    /**
     * Remove credentials with configuration
     * @param {Object} config - the configuraiton
     */
    public removeCredentials(config?) {
        let providerName = 'AWSCognito';
        if (config && config.providerName) providerName = config.providerName;

        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                pluggable.removeCredentials();
            }
        });
    }

    /**
     * cut credentials to compact version
     * @param params 
     */
    public essentialCredentials(params) {
        let providerName = 'AWSCognito';
        if (params && params.providerName) providerName = params.providerName;

        let ret = null;
        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === providerName) {
                ret = pluggable.essentialCredentials(params);
            }
        });

        return ret;
    }

    /**
     * Get credentials with configuration
     * @param {Object} config - the configuraiton
     */
    public getCredentials(config?) {
        let providerName = 'AWSCognito';
        if (config && config.providerName) providerName = config.providerName;

        const that = this;
        return new Promise((res, rej) => {
            that._pluggables.map((pluggable) => {
                if (providerName && pluggable.getProviderName() === providerName) {
                    pluggable.getCredentials(config)
                        .then(cred => {
                            res(cred);
                        }).catch(err => {
                            res(null);
                        });
                } else {
                    logger.debug('no provider found');
                    res(null);
                }
            });
        });
    }
}
