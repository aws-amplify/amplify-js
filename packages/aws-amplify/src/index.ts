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

export {
    Analytics,
    AnalyticsClass,
    AnalyticsProvider,
    AWSPinpointProvider, 
    AWSKinesisProvider } from '@aws-amplify/analytics';
export { Auth, AuthClass } from '@aws-amplify/auth';
export { Storage, StorageClass } from '@aws-amplify/storage';
export { API, APIClass, graphqlOperation } from '@aws-amplify/api';
export { PubSub, PubSubClass } from '@aws-amplify/pubsub';
export { default as Cache } from '@aws-amplify/cache';
export { Interactions, InteractionsClass } from '@aws-amplify/interactions';
export { default as UI } from '@aws-amplify/ui';
export { XR, XRClass } from '@aws-amplify/xr';
export { 
    Amplify, 
    ConsoleLogger as Logger,
    Hub,
    JS,
    ClientDevice,
    Signer,
    I18n,
    ServiceWorker
} from '@aws-amplify/core';

import { 
    Amplify, 
    I18n, // Deprecated
    Logger // Deprecated
} from '@aws-amplify/core';

import Analytics from '@aws-amplify/analytics';
import Auth from '@aws-amplify/auth';
import Storage from '@aws-amplify/storage';
import API from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import Cache from '@aws-amplify/cache';
import Interactions from '@aws-amplify/interactions';
import * as UI from '@aws-amplify/ui';
import XR from '@aws-amplify/xr';

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
Amplify.UI = UI;
Amplify.XR = XR;

export default Amplify;

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

// export {
//     Analytics,
//     AnalyticsClass,
//     AnalyticsProvider,
//     AWSPinpointProvider, 
//     AWSKinesisProvider } from '@aws-amplify/analytics';
// export { Auth, AuthClass } from '@aws-amplify/auth';
// export { Storage, StorageClass } from '@aws-amplify/storage';
// export { API, APIClass, graphqlOperation } from '@aws-amplify/api';
// export { PubSub, PubSubClass } from '@aws-amplify/pubsub';
// export { default as Cache } from '@aws-amplify/cache';
// export { Interactions, InteractionsClass } from '@aws-amplify/interactions';
// export { default as UI } from '@aws-amplify/ui';
// export { XR, XRClass } from '@aws-amplify/xr';
// export { 
//     Amplify, 
//     ConsoleLogger as Logger,
//     Hub,
//     JS,
//     ClientDevice,
//     Signer,
//     I18n,
//     ServiceWorker
// } from '@aws-amplify/core';
// import { Amplify } from '@aws-amplify/core';
// export default Amplify;

// Amplify.Auth = Auth;
// Amplify.Analytics = Analytics;
// Amplify.API = API;
// Amplify.Storage = Storage;
// Amplify.I18n = I18n;
// Amplify.Cache = Cache;
// Amplify.PubSub = PubSub;
// Amplify.Logger = Logger;
// Amplify.ServiceWorker = ServiceWorker;
// Amplify.Interactions = Interactions;
// Amplify.UI = UI;
// Amplify.XR = XR;