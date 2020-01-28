'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
var analytics_1 = require('@aws-amplify/analytics');
exports.Analytics = analytics_1.default;
exports.AnalyticsClass = analytics_1.AnalyticsClass;
exports.AWSPinpointProvider = analytics_1.AWSPinpointProvider;
exports.AWSKinesisProvider = analytics_1.AWSKinesisProvider;
exports.AWSKinesisFirehoseProvider = analytics_1.AWSKinesisFirehoseProvider;
exports.AmazonPersonalizeProvider = analytics_1.AmazonPersonalizeProvider;
var auth_1 = require('@aws-amplify/auth');
exports.Auth = auth_1.default;
exports.AuthClass = auth_1.AuthClass;
var storage_1 = require('@aws-amplify/storage');
exports.Storage = storage_1.default;
exports.StorageClass = storage_1.StorageClass;
var api_1 = require('@aws-amplify/api');
exports.API = api_1.default;
exports.APIClass = api_1.APIClass;
exports.graphqlOperation = api_1.graphqlOperation;
var pubsub_1 = require('@aws-amplify/pubsub');
exports.PubSub = pubsub_1.default;
exports.PubSubClass = pubsub_1.PubSubClass;
var cache_1 = require('@aws-amplify/cache');
exports.Cache = cache_1.default;
var interactions_1 = require('@aws-amplify/interactions');
exports.Interactions = interactions_1.default;
exports.InteractionsClass = interactions_1.InteractionsClass;
var UI = require('@aws-amplify/ui');
exports.UI = UI;
var xr_1 = require('@aws-amplify/xr');
exports.XR = xr_1.default;
exports.XRClass = xr_1.XRClass;
var predictions_1 = require('@aws-amplify/predictions');
exports.Predictions = predictions_1.default;
var core_1 = require('@aws-amplify/core');
exports.Logger = core_1.ConsoleLogger;
exports.Hub = core_1.Hub;
exports.JS = core_1.JS;
exports.ClientDevice = core_1.ClientDevice;
exports.Signer = core_1.Signer;
exports.I18n = core_1.I18n;
exports.ServiceWorker = core_1.ServiceWorker;
exports.default = core_1.default;
core_1.default.Auth = auth_1.default;
core_1.default.Analytics = analytics_1.default;
core_1.default.API = api_1.default;
core_1.default.Storage = storage_1.default;
core_1.default.I18n = core_1.I18n;
core_1.default.Cache = cache_1.default;
core_1.default.PubSub = pubsub_1.default;
core_1.default.Logger = core_1.ConsoleLogger;
core_1.default.ServiceWorker = core_1.ServiceWorker;
core_1.default.Interactions = interactions_1.default;
core_1.default.UI = UI;
core_1.default.XR = xr_1.default;
core_1.default.Predictions = predictions_1.default;
//# sourceMappingURL=index.js.map
