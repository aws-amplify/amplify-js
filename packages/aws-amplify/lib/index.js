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
var Cache_1 = require("./Cache");
exports.Cache = Cache_1.default;
var common_1 = require("@aws-amplify/common");
exports.Logger = common_1.ConsoleLogger;
exports.Hub = common_1.Hub;
exports.JS = common_1.JS;
exports.ClientDevice = common_1.ClientDevice;
exports.Signer = common_1.Signer;
exports.I18n = common_1.I18n;
var logger = new common_1.ConsoleLogger('Amplify');
var Amplify = /** @class */ (function () {
    function Amplify() {
    }
    Amplify.configure = function (config) {
        if (!config) {
            return;
        }
        Auth_1.default.configure(config);
        common_1.I18n.configure(config);
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
Amplify.I18n = common_1.I18n;
Amplify.Cache = Cache_1.default;
Amplify.PubSub = PubSub_1.default;
Amplify.Logger = common_1.ConsoleLogger;
//# sourceMappingURL=index.js.map