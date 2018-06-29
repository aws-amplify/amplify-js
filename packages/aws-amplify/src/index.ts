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

import Analytics, { AnalyticsClass, AnalyticsProvider, AWSPinpointProvider, AWSKinesisProvider } from './Analytics';
import Auth, { AuthClass } from './Auth';
import Storage, { StorageClass } from './Storage';
import API, { APIClass, graphqlOperation } from './API';
import PubSub, { PubSubClass } from './PubSub';
import Cache from './Cache';
import Interactions, { InteractionsClass } from './Interactions';
import {
    ConsoleLogger as Logger,
    Hub,
    JS,
    ClientDevice,
    Signer,
    I18n,
    Amplify,
    ServiceWorker
} from './Common';

export default Amplify;

Amplify.Auth = Auth;
Amplify.Analytics = Analytics;
Amplify.API = API;
Amplify.Storage = Storage;
Amplify.I18n = I18n;
Amplify.Cache = Cache;
Amplify.PubSub = PubSub;
Amplify.Logger = Logger;
Amplify.ServiceWorker = ServiceWorker;
Amplify.Interactions = Interactions;

export { 
    Auth, 
    Analytics, 
    Storage,
    API, 
    PubSub, 
    I18n, 
    Logger, 
    Hub, 
    Cache, 
    JS, 
    ClientDevice, 
    Signer, 
    ServiceWorker, 
    Interactions 
};

export { 
    AuthClass, 
    AnalyticsClass, 
    APIClass, 
    StorageClass,
    PubSubClass,
    InteractionsClass,
    AnalyticsProvider, 
    AWSPinpointProvider, 
    AWSKinesisProvider 
};
export { graphqlOperation };
