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

import Auth from './Auth';
import Analytics from './Analytics';
import API from './API';
import Cache from './Cache';
import Storage from './Storage';

import I18n from './I18n';
import { ConsoleLogger as Logger } from './Common';

import * as Components from './components';
import { Authenticator, withAuthenticator, S3Album, S3Image } from './components';

const logger = new Logger('Amplify');

export default class Amplify {
    static configure(config) {
        logger.info('configure Amplify');

        Auth.configure(config);
        Analytics.configure(config);
        I18n.configure(config);
        Storage.configure(config);

        API.configure(config);
        API.createInstance();
        Cache.configure(config);
    }
}

Amplify.Auth = Auth;
Amplify.Analytics = Analytics;
Amplify.API = API;
Amplify.Cache = Cache;
Amplify.Storage = Storage;

Amplify.I18n = I18n;
Amplify.Logger = Logger;

Amplify.Components = Components;
Amplify.withAuthenticator = withAuthenticator;

export { Auth, Authenticator, Analytics, API, Cache, Storage, I18n, Logger, Components, withAuthenticator, S3Album, S3Image };