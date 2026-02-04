"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
exports.__esModule = true;
exports.allPublicPaths = void 0;
var Amplify = require("aws-amplify");
var analytics = require("aws-amplify/analytics");
var analyticsPinpoint = require("aws-amplify/analytics/pinpoint");
var analyticsKinesis = require("aws-amplify/analytics/kinesis");
var analyticsPersonalize = require("aws-amplify/analytics/personalize");
var analyticsFirehose = require("aws-amplify/analytics/kinesis-firehose");
var auth = require("aws-amplify/auth");
var authCognito = require("aws-amplify/auth/cognito");
var authServer = require("aws-amplify/auth/server");
var authCognitoServer = require("aws-amplify/auth/cognito/server");
var storage = require("aws-amplify/storage");
var storageServer = require("aws-amplify/storage/server");
var storageS3 = require("aws-amplify/storage/s3");
var storageS3Server = require("aws-amplify/storage/s3/server");
var api = require("aws-amplify/api");
var apiServer = require("aws-amplify/api/server");
var dataStore = require("aws-amplify/datastore");
var interactions = require("@aws-amplify/interactions");
var predictions = require("@aws-amplify/predictions");
var geo = require("@aws-amplify/geo");
var pubsub = require("@aws-amplify/pubsub");
var utils = require("aws-amplify/utils");
exports.allPublicPaths = [
    // Singleton
    Amplify,
    // Analytics
    analytics,
    analyticsFirehose,
    analyticsKinesis,
    analyticsPersonalize,
    analyticsPinpoint,
    // Auth
    auth,
    authCognito,
    authServer,
    authCognitoServer,
    // Storage
    storage,
    storageServer,
    storageS3,
    storageS3Server,
    // API
    api,
    apiServer,
    // DataStore
    dataStore,
    // Interactions
    interactions,
    // Predictions
    predictions,
    // Geo
    geo,
    // PubSub
    pubsub,
    // Utils
    utils,
    // Skipping React Native packages and Next.js-only packages
];
