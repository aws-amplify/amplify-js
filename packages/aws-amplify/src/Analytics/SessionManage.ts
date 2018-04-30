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
import { Hub, Platform } from '@aws-amplify/core';

// detect session stop
const date = new Date();
let preInteract = date.getTime();
const expireTime = 30*60*1000; // 30mins

const actions = ['mousemove', 'keydown', 'scroll'];

if (!Platform.isReactNative) {
    actions.map(action => {
        document.addEventListener(action, () => {
            const curInteract = date.getTime();
            if (preInteract + expireTime < curInteract) {
                Hub.dispatch('analytics', { eventType: 'session_start' }, 'Analytics');
            }
            preInteract = curInteract;
        });
    });
}
