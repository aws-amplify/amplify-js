// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as Amplify from 'aws-amplify';

import * as analytics from 'aws-amplify/analytics';
import * as analyticsPinpoint from 'aws-amplify/analytics/pinpoint';
import * as analyticsKinesis from 'aws-amplify/analytics/kinesis';
import * as analyticsPersonalize from 'aws-amplify/analytics/personalize';
import * as analyticsFirehose from 'aws-amplify/analytics/kinesis-firehose';

import * as auth from 'aws-amplify/auth';
import * as authCognito from 'aws-amplify/auth/cognito';
import * as authServer from 'aws-amplify/auth/server';
import * as authCognitoServer from 'aws-amplify/auth/cognito/server';

import * as storage from 'aws-amplify/storage';
import * as storageServer from 'aws-amplify/storage/server';
import * as storageS3 from 'aws-amplify/storage/s3';
import * as storageS3Server from 'aws-amplify/storage/s3/server';

import * as api from 'aws-amplify/api';
import * as apiServer from 'aws-amplify/api/server';

import * as dataStore from 'aws-amplify/datastore';

import * as interactions from '@aws-amplify/interactions';

import * as predictions from '@aws-amplify/predictions';

import * as geo from '@aws-amplify/geo';

import * as pubsub from '@aws-amplify/pubsub';

import * as utils from 'aws-amplify/utils';

export const allPublicPaths = [
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
