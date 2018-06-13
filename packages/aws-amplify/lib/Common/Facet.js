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
// import * as AWS from 'aws-sdk/global';
var S3 = require("aws-sdk/clients/s3");
exports.S3 = S3;
var AWS = require("aws-sdk/global");
exports.AWS = AWS;
var Cognito = require("amazon-cognito-identity-js");
exports.Cognito = Cognito;
var Pinpoint = require("aws-sdk/clients/pinpoint");
exports.Pinpoint = Pinpoint;
var MobileAnalytics = require("aws-sdk/clients/mobileanalytics");
exports.MobileAnalytics = MobileAnalytics;
var CognitoHostedUI = require("amazon-cognito-auth-js");
exports.CognitoHostedUI = CognitoHostedUI;
//# sourceMappingURL=Facet.js.map