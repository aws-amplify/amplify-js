/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { XRProvider, XROptions } from './types';

const logger = new Logger('XR');

export default class XR {

    private _options: XROptions;

    private _pluggables: XRProvider[];

    /**
     * Initialize XR with AWS configurations
     * 
     * @param {XROptions} options - Configuration object for XR
     */
    constructor(options: XROptions) {
        this._options = options;
        logger.debug('XR Options', this._options);
        this._pluggables = [];
    }

    /**
     * Configure XR part with configurations
     * 
     * @param {XROptions} config - Configuration for XR
     * @return {Object} - The current configuration
     */
    configure(options: XROptions) {
        const opt = options ? options.XR || options : {};
        logger.debug('configure XR', { opt });

        this._options = Object.assign({}, this._options, opt);

        this._pluggables.map((pluggable) => pluggable.configure(this._options));

        return this._options;
    }

    /**
     * add plugin into XR category
     * @param {Object} pluggable - an instance of the plugin
     */
    public async addPluggable(pluggable: XRProvider) {
        if (pluggable && pluggable.getCategory() === 'XR') {
            this._pluggables.push(pluggable);

            const config = pluggable.configure(this._options);

            return config;
        }
    }

    loadScene(sceneId: string) {
        this._pluggables.map(provider => provider.loadScene(sceneId));
    }
}