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
var Common_1 = require("./Common");
exports.Logger = Common_1.ConsoleLogger;
exports.Hub = Common_1.Hub;
exports.JS = Common_1.JS;
exports.ClientDevice = Common_1.ClientDevice;
exports.Signer = Common_1.Signer;
exports.I18n = Common_1.I18n;
exports.ServiceWorker = Common_1.ServiceWorker;
exports.default = Common_1.Amplify;
Common_1.Amplify.Auth = Auth_1.default;
Common_1.Amplify.Analytics = Analytics_1.default;
Common_1.Amplify.API = API_1.default;
Common_1.Amplify.Storage = Storage_1.default;
Common_1.Amplify.I18n = Common_1.I18n;
Common_1.Amplify.Cache = Cache_1.default;
Common_1.Amplify.PubSub = PubSub_1.default;
Common_1.Amplify.Logger = Common_1.ConsoleLogger;
Common_1.Amplify.ServiceWorker = Common_1.ServiceWorker;
//# sourceMappingURL=index.js.map