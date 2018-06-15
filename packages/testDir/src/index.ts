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

import Auth, { AuthClass } from '@aws-amplify/auth';

import Cache from '@aws-amplify/cache';
import {
    ConsoleLogger as Logger,
    Hub,
    JS,
    ClientDevice,
    Signer,
    I18n,
    Amplify,
    ServiceWorker
} from '@aws-amplify/core';

export default Amplify;

Amplify.Auth = Auth;
Amplify.Storage = Storage;
Amplify.I18n = I18n;
Amplify.Cache = Cache;
Amplify.Logger = Logger;
Amplify.ServiceWorker = ServiceWorker;

export { Auth, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer, ServiceWorker };
export { 
    AuthClass,
};
