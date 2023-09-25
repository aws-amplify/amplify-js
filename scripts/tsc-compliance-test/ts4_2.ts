// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as Amplify from 'aws-amplify';
import * as analytics from 'aws-amplify/analytics';

import * as auth from 'aws-amplify/auth';
import * as authCognito from 'aws-amplify/auth/cognito';
import * as authServer from 'aws-amplify/auth/server';
import * as authCognitoServer from 'aws-amplify/auth/cognito/server';

import * as storage from 'aws-amplify/storage';
import * as storageServer from 'aws-amplify/storage/server';
import * as storageS3 from 'aws-amplify/storage/s3';
import * as storageS3Server from 'aws-amplify/storage/s3/server';

import * as utils from 'aws-amplify/utils';

export const allPublicPaths = [
	Amplify,
	analytics,
	auth,
	authCognito,
	authServer,
	authCognitoServer,
	storage,
	storageServer,
	storageS3,
	storageS3Server,
	utils,
];
