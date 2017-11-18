"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var Analytics_1 = require("./Analytics");
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('Analytics');
var _instance = null;
if (!_instance) {
    logger.debug('Create Analytics Instance');
    _instance = new Analytics_1.default(null);
}
var Analytics = _instance;
exports.default = Analytics;
Analytics.onHubCapsule = function (capsule) {
    var channel = capsule.channel, payload = capsule.payload, source = capsule.source;
    logger.debug('on hub capsule ' + channel, payload);
    switch (name) {
        case 'auth':
            authEvent(payload);
            break;
    }
};
var authEvent = function (payload) {
    var event = payload.event;
    if (!event) {
        return;
    }
    switch (event) {
        case 'signIn':
            Analytics.restart();
            Analytics.record('_userauth.sign_in');
            break;
        case 'signUp':
            Analytics.record('_userauth.sign_up');
            break;
        case 'signOut':
            Analytics.restart();
            break;
        case 'signIn_failure':
            Analytics.record('_userauth.auth_fail');
            break;
    }
};
Common_1.Hub.listen('auth', Analytics);
//# sourceMappingURL=index.js.map