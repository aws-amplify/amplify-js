// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: delete this module when the Auth class is removed.

import { ConsoleLogger } from '@aws-amplify/core';

import { AuthErrorMessages, AuthErrorTypes } from './types/Auth';
import { AuthErrorStrings } from './common/AuthErrorStrings';

const logger = new ConsoleLogger('AuthError');

export class AuthError extends Error {
	public log: string;
	constructor(type: AuthErrorTypes) {
		const { message, log } = authErrorMessages[type];
		super(message);

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = AuthError;
		Object.setPrototypeOf(this, AuthError.prototype);

		this.name = 'AuthError';
		this.log = log || message;

		logger.error(this.log);
	}
}

export class NoUserPoolError extends AuthError {
	constructor(type: AuthErrorTypes) {
		super(type);

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = NoUserPoolError;
		Object.setPrototypeOf(this, NoUserPoolError.prototype);

		this.name = 'NoUserPoolError';
	}
}

export const authErrorMessages: AuthErrorMessages = {
	oauthSignInError: {
		message: AuthErrorStrings.OAUTH_ERROR,
		log: 'Make sure Cognito Hosted UI has been configured correctly',
	},
	noConfig: {
		message: AuthErrorStrings.DEFAULT_MSG,
		log: `
            Error: Amplify has not been configured correctly.
            This error is typically caused by one of the following scenarios:

            1. Make sure you're passing the awsconfig object to Amplify.configure() in your app's entry point
                See https://aws-amplify.github.io/docs/js/authentication#configure-your-app for more information
            
            2. There might be multiple conflicting versions of amplify packages in your node_modules.
				Refer to our docs site for help upgrading Amplify packages (https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js)
        `,
	},
	missingAuthConfig: {
		message: AuthErrorStrings.DEFAULT_MSG,
		log: `
            Error: Amplify has not been configured correctly. 
            The configuration object is missing required auth properties.
            This error is typically caused by one of the following scenarios:

            1. Did you run \`amplify push\` after adding auth via \`amplify add auth\`?
                See https://aws-amplify.github.io/docs/js/authentication#amplify-project-setup for more information

            2. This could also be caused by multiple conflicting versions of amplify packages, see (https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js) for help upgrading Amplify packages.
        `,
	},
	emptyUsername: {
		message: AuthErrorStrings.EMPTY_USERNAME,
	},
	// TODO: should include a list of valid sign-in types
	invalidUsername: {
		message: AuthErrorStrings.INVALID_USERNAME,
	},
	emptyPassword: {
		message: AuthErrorStrings.EMPTY_PASSWORD,
	},
	emptyCode: {
		message: AuthErrorStrings.EMPTY_CODE,
	},
	signUpError: {
		message: AuthErrorStrings.SIGN_UP_ERROR,
		log: 'The first parameter should either be non-null string or object',
	},
	noMFA: {
		message: AuthErrorStrings.NO_MFA,
	},
	invalidMFA: {
		message: AuthErrorStrings.INVALID_MFA,
	},
	emptyChallengeResponse: {
		message: AuthErrorStrings.EMPTY_CHALLENGE,
	},
	noUserSession: {
		message: AuthErrorStrings.NO_USER_SESSION,
	},
	deviceConfig: {
		message: AuthErrorStrings.DEVICE_CONFIG,
	},
	networkError: {
		message: AuthErrorStrings.NETWORK_ERROR,
	},
	autoSignInError: {
		message: AuthErrorStrings.AUTOSIGNIN_ERROR,
	},
	default: {
		message: AuthErrorStrings.DEFAULT_MSG,
	},
};
