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
    ClientDevice,
    ConsoleLogger as Logger,
    missingConfig,
    Parser
} from '../Common';
import AWSAnalyticsProvider from './Providers/AWSAnalyticsProvider';
import Auth from '../Auth';

import { EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');
const NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    private _pluggables;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor() {
        this._buffer = [];
        this._config = {};
        this._pluggables = [];
        // default one
        this._pluggables.push(new AWSAnalyticsProvider());
    }

    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    public configure(config) {
        logger.debug('configure Analytics');
        const conf = Object.assign({}, this._config, Parser.parseMobilehubConfig(config).Analytics);

        const clientInfo:any = ClientDevice.clientInfo();
        conf['clientInfo'] = conf['client_info']? conf['client_info'] : clientInfo;

        this._config = conf;

        this._pluggables.map((pluggable) => {
            pluggable.configure(this._config);
        });
        return conf;
    }

    /**
     * @async
     * init clients for Anlytics including mobile analytics and pinpoint
     * @return - True if initilization succeeds
     */
    // public async init() {
    //     const credentialsOK = await this._ensureCredentials();
    //     if (!credentialsOK) { return false; }
    //     logger.debug('init clients with config', this._config);
        
    //     // default one
    //     if (!this._provider) {
    //         this._provider = new AWSAnalyticsProvider();
    //     }
    //     return this._provider.init(this._config);
    // }

    /**
     * set the Analytics client
     * @param provider 
     */
    public setProvider(provider) {
        this._provider = provider;
    }

    public addPluggable(pluggable) {
        if (pluggable) {
            this._pluggables.push(pluggable);
            pluggable.configure(this._config);
        }
    }

    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    public async startSession() {
        //return this._provider.putEvent({eventName: 'session_start'});
        await this._getCredentials();
        this._pluggables.map((pluggable) => {
            pluggable.startSession(this._config);
        });
    }

    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    public async stopSession() {
        //return this._provider.putEvent({eventName: 'session_stop'});
        await this._getCredentials();
        this._pluggables.map((pluggable) => {
            pluggable.stopSession(this._config);
        });
    }

    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if event record successfully
     */
    public async record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        //return this._provider.putEvent({eventName, attributes, metrics});

        await this._getCredentials();
        this._pluggables.map((pluggable) => {
            pluggable.record({eventName, attributes, metrics}, this._config);
        });
    }

    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise which resolves to be true if current credential exists
     */
    // async restart() {
    //     return this.init();
    // }

    /**
     * @private
     * check if current crednetials exists
     */
    private _getCredentials() {
        const conf = this._config;

        return Auth.currentCredentials()
            .then(credentials => {
                const cred = Auth.essentialCredentials(credentials);

                conf.credentials = cred;
                conf.endpointId = conf.credentials.identityId;
                logger.debug('set endpointId for analytics', conf.endpointId);
                logger.debug('set credentials for analytics', conf.credentials);

                return true;
            })
            .catch(err => {
                logger.debug('ensure credentials error', err);
                return false;
            });
    }
}
