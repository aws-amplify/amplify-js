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

import Analytics, { AnalyticsClass, AnalyticsProvider } from './Analytics';
import Auth, { AuthClass } from './Auth';
import Storage, { StorageClass } from './Storage';
import API, { APIClass, graphqlOperation } from './API';
import PubSub from './PubSub';
import I18n from './I18n';
import Cache from './Cache';
import {
    ConsoleLogger as Logger,
    Hub,
    JS,
    ClientDevice,
    Signer
} from './Common';

const logger = new Logger('Amplify');

export default class Amplify {
    static Auth: AuthClass = null;
    static Analytics: AnalyticsClass = null;
    static API: APIClass = null;
    static Storage: StorageClass = null;
    static I18n = null;
    static Cache = null;
    static PubSub = null;

    static Logger = null;

    static configure(config) {
        if (!config) { return; }
        Auth.configure(config);
        I18n.configure(config);
        Analytics.configure(config);
        API.configure(config);
        Storage.configure(config);
        Cache.configure(config);
        PubSub.configure(config);

        return config;
    }

    static addPluggable(pluggable) {
        if (pluggable && pluggable['getCategory'] && typeof pluggable['getCategory'] === 'function') {
            const category = pluggable.getCategory();
            switch (category) {
                case 'Analytics':
                    Analytics.addPluggable(pluggable);
                    break;
                case 'Auth':
                    break;
                case 'API':
                    break;
                case 'Cache':
                    break;
                case 'Storage':
                    break;
                case 'PubSub':
                    PubSub.addPluggable(pluggable);
                    break;
                default:
                    break;
            }
        }
    }
}

Amplify.Auth = Auth;
Amplify.Analytics = Analytics;
Amplify.API = API;
Amplify.Storage = Storage;
Amplify.I18n = I18n;
Amplify.Cache = Cache;
Amplify.PubSub = PubSub;

Amplify.Logger = Logger;

export { Auth, Analytics, Storage, API, PubSub, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer };
export { AuthClass, AnalyticsClass, APIClass, StorageClass, AnalyticsProvider };
export { graphqlOperation };
