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
    Pinpoint,
    AMA,
    ClientDevice,
    ConsoleLogger as Logger,
    missingConfig
} from '../Common';

import Auth from '../Auth';

import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from './types'

const logger = new Logger('AnalyticsClass');
const ama_logger = new Logger('AMA');
ama_logger.log = ama_logger.verbose;

/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;

    private amaClient: any;
    private pinpointClient: any;

    private _buffer;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions) {
        this.configure(config);

        const client_info:any = ClientDevice.clientInfo();
        if (client_info.platform) { this._config.platform = client_info.platform; }

        if (!this._config.clientId) {
            const credentials = this._config.credentials;
            if (credentials && credentials.identityId) {
                this._config.clientId = credentials.identityId;
            }
        }

        this._buffer = [];
    } 

    configure(config) {
        logger.debug('configure Analytics');
        let conf = config? config.Analytics || config : {};
        
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                platform: 'other'
            };
        }
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);
        if (!this._config.appId) { logger.debug('Do not have appId yet.'); }

        this._initClients();

        return this._config;
    }

    /**
     * Record Session start
     */
    async startSession() {
        if (this.amaClient) {
            this.amaClient.startSession();
        }
    }

    /**
     * Record Session stop
     */
    async stopSession() {
        if (this.amaClient) {
            this.amaClient.stopSession();
        }
    }

    /**
     * Restart Analytics client with credentials provided
     * @param {Object} credentials - Cognito Credentials
     */
    restart() {
        try {
            this.stopSession();
            this._initClients();
        } catch(e) {
            logger.debug('restart error', e);
        }
    }

    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    async record(name: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        logger.debug('record event ' + name);
        if (!this.amaClient) {
            logger.debug('amaClient not ready, put in buffer');
            this._buffer.push({
                name: name,
                attribtues: attributes,
                metrics: metrics
            });
            return;
        }

        this.amaClient.recordEvent(name, attributes, metrics);
    }

    /**
    * Record one analytic event
    * @param {String} name - Event name
    * @param {Object} [attributes] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    async recordMonetization(name, attributes?: EventAttributes, metrics?: EventMetrics) {
        this.amaClient.recordMonetizationEvent(name, attributes, metrics);
    }

    _checkConfig() {
        return !!this._config.appId;
    }

    _ensureCredentials() {
        const conf = this._config;
        if (conf.credentials) { return Promise.resolve(true); }

        return Auth.currentCredentials()
            .then(credentials => {
                const cred = Auth.essentialCredentials(credentials);
                logger.debug('set credentials for analytics', cred);
                conf.credentials = cred;

                if (!conf.clientId && conf.credentials) {
                    conf.clientId = conf.credentials.identityId;
                }

                return true;
            })
            .catch(err => {
                logger.debug('ensure credentials error', err)
                return false;
            });
    }

    async _initClients() {
        if (!this._checkConfig()) { return false; }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return false; }

        this._initAMA();
        this._initPinpoint();
        this.startSession();
    }

    /**
     * Init AMA client with configuration
     */
    _initAMA() {
        const { appId, clientId, region, credentials, platform } = this._config;
        this.amaClient = new AMA.Manager({
            appId: appId,
            platform: platform,
            clientId: clientId,
            logger: ama_logger,
            clientOptions: {
                region: region,
                credentials: credentials
            }
        });

        if (this._buffer.length > 0) {
            logger.debug('something in buffer, flush it');
            const buffer = this._buffer;
            this._buffer = [];
            buffer.forEach(event => {
                this.amaClient.recordEvent(event.name, event.attributes, event.metrics);
            });
        }
    }

    /**
     * Init Pinpoint with configuration and update pinpoint client endpoint
     */
    _initPinpoint() {
        const { region, appId, clientId, credentials } = this._config;
        this.pinpointClient = new Pinpoint({
            region: region,
            credentials: credentials
        });

        const request = this._endpointRequest();
        const update_params = {
            ApplicationId: appId,
            EndpointId: clientId,
            EndpointRequest: request
        };
        logger.debug(update_params);

        this.pinpointClient.updateEndpoint(update_params, function(err, data) {
            if (err) {
                logger.debug('Pinpoint ERROR', err);
            } else {
                logger.debug('Pinpoint SUCCESS', data);
            }
        });
    }

    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    _endpointRequest() {
        const client_info: any = ClientDevice.clientInfo();
        const credentials = this._config.credentials;
        const user_id = credentials.authenticated? credentials.identityId : null;
        logger.debug('demographic user id: ' + user_id);
        return {
            Demographic: {
                AppVersion: this._config.appVersion || client_info.appVersion,
                Make: client_info.make,
                Model: client_info.model,
                ModelVersion: client_info.version,
                Platform: client_info.platform
            },
            User: { UserId: user_id }
        };
    }
}
