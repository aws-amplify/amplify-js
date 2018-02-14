"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var Common_1 = require("../Common");
var Platform_1 = require("../Common/Platform");
// detect session stop
var date = new Date();
var preInteract = date.getTime();
var expireTime = 30 * 60 * 1000; // 30mins
var actions = ['mousemove', 'keydown', 'scroll'];
if (!Platform_1.default.isReactNative) {
    actions.map(function (action) {
        document.addEventListener(action, function () {
            var curInteract = date.getTime();
            if (preInteract + expireTime < curInteract) {
                Common_1.Hub.dispatch('analytics', { eventType: 'session_start' }, 'Analytics');
            }
            preInteract = curInteract;
        });
    });
}
//# sourceMappingURL=SessionManage.js.map