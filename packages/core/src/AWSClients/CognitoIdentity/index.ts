import {
	fromCognitoIdentity,
	FromCognitoIdentityParameters,
	fromCognitoIdentityPool,
	FromCognitoIdentityPoolParameters,
} from '@aws-sdk/credential-provider-cognito-identity';
import {
	GetIdCommand,
	GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';

export {
	fromCognitoIdentity,
	FromCognitoIdentityParameters,
	fromCognitoIdentityPool,
	FromCognitoIdentityPoolParameters,
	GetCredentialsForIdentityCommand,
	GetIdCommand,
};

export { createCognitoIdentityClient } from './CognitoIdentityClient';
