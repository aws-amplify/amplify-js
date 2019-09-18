/*
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { AuthErrorMessages, AuthErrorTypes } from './types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('AuthError');
const DEFAULT_MSG = 'Authentication Error';

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
	noConfig: {
		message: DEFAULT_MSG,
		log: `
            Error: Amplify has not been configured correctly.
            This error is typically caused by one of the following scenarios:

            1. Make sure you're passing the awsconfig object to Amplify.configure() in your app's entry point
                See https://aws-amplify.github.io/docs/js/authentication#configure-your-app for more information
            
            2. There might be multiple conflicting versions of aws-amplify or amplify packages in your node_modules.
                Try deleting your node_modules folder and reinstalling the dependencies with \`yarn install\`
        `,
	},
	missingAuthConfig: {
		message: DEFAULT_MSG,
		log: `
            Error: Amplify has not been configured correctly. 
            The configuration object is missing required auth properties. 
            Did you run \`amplify push\` after adding auth via \`amplify add auth\`?
            See https://aws-amplify.github.io/docs/js/authentication#amplify-project-setup for more information
        `,
	},
	emptyUsername: {
		message: 'Username cannot be empty',
	},
	// TODO: should include a list of valid sign-in types
	invalidUsername: {
		message:
			'The username should either be a string or one of the sign in types',
	},
	emptyPassword: {
		message: 'Password cannot be empty',
	},
	emptyCode: {
		message: 'Confirmation code cannot be empty',
	},
	signUpError: {
		message: 'Error creating account',
		log: 'The first parameter should either be non-null string or object',
	},
	noMFA: {
		message: 'No valid MFA method provided',
	},
	invalidMFA: {
		message: 'Invalid MFA type',
	},
	emptyChallengeResponse: {
		message: 'Challenge response cannot be empty',
	},
	noUserSession: {
		message: 'Failed to get the session because the user is empty',
	},
	default: {
		message: DEFAULT_MSG,
	},
};
