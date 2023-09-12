import * as Amplify from 'aws-amplify';
import * as analytics from 'aws-amplify/analytics';

import * as auth from 'aws-amplify/auth';
import * as authCognito from 'aws-amplify/auth/cognito';
import * as authServer from 'aws-amplify/auth/server';
// TODO[AllanZhengYP]: uncomment this line when we have the server side auth module
// import * as authCognitoServer from 'aws-amplify/auth/cognito/server';

import * as storage from 'aws-amplify/storage';
import * as storageServer from 'aws-amplify/storage/server';
import * as storageS3 from 'aws-amplify/storage/s3';
import * as storageS3Server from 'aws-amplify/storage/s3/server';

import * as utils from 'aws-amplify/utils';

console.log([
	Amplify,
	analytics,
	auth,
	authCognito,
	authServer,
	// TODO[AllanZhengYP]: uncomment this line when we have the server side auth module
	// authCognitoServer,
	storage,
	storageServer,
	storageS3,
	storageS3Server,
	utils,
]);
