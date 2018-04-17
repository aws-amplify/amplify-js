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
exports.Analytics = Analytics_1.default;
exports.AnalyticsClass = Analytics_1.AnalyticsClass;
var Auth_1 = require("./Auth");
exports.Auth = Auth_1.default;
exports.AuthClass = Auth_1.AuthClass;
var Storage_1 = require("./Storage");
exports.Storage = Storage_1.default;
exports.StorageClass = Storage_1.StorageClass;
var API_1 = require("./API");
exports.API = API_1.default;
exports.APIClass = API_1.APIClass;
exports.graphqlOperation = API_1.graphqlOperation;
var PubSub_1 = require("./PubSub");
exports.PubSub = PubSub_1.default;
var I18n_1 = require("./I18n");
exports.I18n = I18n_1.default;
var Cache_1 = require("./Cache");
exports.Cache = Cache_1.default;
var Common_1 = require("./Common");
exports.Logger = Common_1.ConsoleLogger;
exports.Hub = Common_1.Hub;
exports.JS = Common_1.JS;
exports.ClientDevice = Common_1.ClientDevice;
exports.Signer = Common_1.Signer;
var logger = new Common_1.ConsoleLogger('Amplify');
var Amplify = /** @class */ (function () {
    function Amplify() {
    }
    Amplify.configure = function (config) {
        if (!config) {
            return;
        }
        Auth_1.default.configure(config);
        I18n_1.default.configure(config);
        Analytics_1.default.configure(config);
        API_1.default.configure(config);
        Storage_1.default.configure(config);
        Cache_1.default.configure(config);
        PubSub_1.default.configure(config);
        return config;
    };
    Amplify.addPluggable = function (pluggable) {
        if (pluggable && pluggable['getCategory'] && typeof pluggable['getCategory'] === 'function') {
            var category = pluggable.getCategory();
            switch (category) {
                case 'Analytics':
                    Analytics_1.default.addPluggable(pluggable);
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
                    PubSub_1.default.addPluggable(pluggable);
                    break;
                default:
                    break;
            }
        }
    };
    Amplify.Auth = null;
    Amplify.Analytics = null;
    Amplify.API = null;
    Amplify.Storage = null;
    Amplify.I18n = null;
    Amplify.Cache = null;
    Amplify.PubSub = null;
    Amplify.Logger = null;
    return Amplify;
}());
exports.default = Amplify;
Amplify.Auth = Auth_1.default;
Amplify.Analytics = Analytics_1.default;
Amplify.API = API_1.default;
Amplify.Storage = Storage_1.default;
Amplify.I18n = I18n_1.default;
Amplify.Cache = Cache_1.default;
Amplify.PubSub = PubSub_1.default;
Amplify.Logger = Common_1.ConsoleLogger;
//# sourceMappingURL=index.js.map