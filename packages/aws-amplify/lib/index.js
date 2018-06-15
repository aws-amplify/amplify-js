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
var analytics_1 = require("@aws-amplify/analytics");
exports.Analytics = analytics_1.default;
exports.AnalyticsClass = analytics_1.AnalyticsClass;
exports.AWSPinpointProvider = analytics_1.AWSPinpointProvider;
exports.AWSKinesisProvider = analytics_1.AWSKinesisProvider;
var auth_1 = require("@aws-amplify/auth");
exports.Auth = auth_1.default;
exports.AuthClass = auth_1.AuthClass;
var storage_1 = require("@aws-amplify/storage");
exports.Storage = storage_1.default;
exports.StorageClass = storage_1.StorageClass;
var api_1 = require("@aws-amplify/api");
exports.API = api_1.default;
exports.APIClass = api_1.APIClass;
exports.graphqlOperation = api_1.graphqlOperation;
var pubsub_1 = require("@aws-amplify/pubsub");
exports.PubSub = pubsub_1.default;
var cache_1 = require("@aws-amplify/cache");
exports.Cache = cache_1.default;
var core_1 = require("@aws-amplify/core");
exports.Logger = core_1.ConsoleLogger;
exports.Hub = core_1.Hub;
exports.JS = core_1.JS;
exports.ClientDevice = core_1.ClientDevice;
exports.Signer = core_1.Signer;
exports.I18n = core_1.I18n;
exports.ServiceWorker = core_1.ServiceWorker;
exports.default = core_1.Amplify;
core_1.Amplify.Auth = auth_1.default;
core_1.Amplify.Analytics = analytics_1.default;
core_1.Amplify.API = api_1.default;
core_1.Amplify.Storage = storage_1.default;
core_1.Amplify.I18n = core_1.I18n;
core_1.Amplify.Cache = cache_1.default;
core_1.Amplify.PubSub = pubsub_1.default;
core_1.Amplify.Logger = core_1.ConsoleLogger;
core_1.Amplify.ServiceWorker = core_1.ServiceWorker;
//# sourceMappingURL=index.js.map