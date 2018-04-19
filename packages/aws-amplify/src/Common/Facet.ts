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

// import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import * as AWS from 'aws-sdk/global';
import * as Cognito from 'amazon-cognito-identity-js';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';
import * as MobileAnalytics from 'aws-sdk/clients/mobileanalytics';
import * as CognitoHostedUI from 'amazon-cognito-auth-js';

export {AWS, S3, Cognito, Pinpoint, MobileAnalytics, CognitoHostedUI };
