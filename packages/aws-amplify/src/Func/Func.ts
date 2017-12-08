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
    Lambda,
    ConsoleLogger as Logger
} from '../Common';

import Auth from '../Auth';
import { FuncOptions } from './types';

const logger = new Logger('FuncClass');

/**
 * Provide func methods to use AWS S3
 */
export default class FuncClass {
    /**
     * @private
     */
    private _options;

    /**
     * Initialize Func with AWS configurations
     * @param {Object} options - Configuration object for func
     */
    constructor(options: FuncOptions) {
        this._options = options;
        logger.debug('Func Options', this._options);
    }

    /**
     * Configure Func part with aws configuration
     * @param {Object} config - Configuration of the Func
     * @return {Object} - Current configuration
     */
    configure(options) {
        logger.debug('configure Func');
        let opt = options? options.Func || options : {};

        if (options['aws_user_files_s3_bucket']) {
            opt = {
                bucket: options['aws_user_files_s3_bucket'],
                region: options['aws_user_files_s3_bucket_region']
            }
        }
        this._options = Object.assign({}, this._options, opt);
        if (!this._options.bucket) { logger.debug('Do not have bucket yet'); }

        return this._options;
    }

    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [options] - { level : private|public }
     * @return - Promise resolves upon successful removal of the object
     */
    public async invoke(parameters, options) :Promise<any> {
        const credentialsOK = await this._ensureCredentials()
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const opt = Object.assign({}, this._options, options);
        const { bucket, region, credentials, level } = opt;

        const lambda = this._createLambda(opt);
        logger.debug('invoke');

        return new Promise<any>((res, rej) => {
            lambda.invoke(parameters, (err,data) => {
                if(err){
                    rej(err);
                } else {
                    res(data);
                }
            });
        });
    }

    /**
     * @private
     */
    _ensureCredentials() {
        if (this._options.credentials) { return Promise.resolve(true); }

        return Auth.currentCredentials()
            .then(credentials => {
                const cred = Auth.essentialCredentials(credentials);
                logger.debug('set credentials for func', cred);
                this._options.credentials = cred;

                return true;
            })
            .catch(err => {
                logger.warn('ensure credentials error', err)
                return false;
            });
    }

    /**
     * @private
     */
    private _prefix(options) {
        const { credentials, level } = options;
        return (level === 'private')? `private/${credentials.identityId}/` : 'public/';
    }

    /**
     * @private
     */
    private _createLambda(options) {
        const { bucket, region, credentials } = options;
        AWS.config.update({
            region: region,
            credentials: credentials
        });
        return  new Lambda({
            apiVersion: '2015-03-31',
            region : region
        });
    }
}
