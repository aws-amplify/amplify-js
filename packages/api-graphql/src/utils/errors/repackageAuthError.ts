// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyErrorParams,
	GraphQLAuthMode,
} from '@aws-amplify/core/internals/utils';

type ErrorObject = {
	errors: AmplifyErrorParams[];
};

/**
 * Checks to see if the given response or subscription message contains an
 * unauth error. If it does, it changes the error message to include instructions
 * for the app developer.
 */
export function repackageUnauthError<T extends ErrorObject>(content: T): T {
	if (content.errors && Array.isArray(content.errors)) {
		content.errors.forEach(e => {
			if (isUnauthError(e)) {
				e.message = 'Unauthorized';
				e.recoverySuggestion =
					`If you're calling an Amplify-generated API, make sure ` +
					`to set the "authMode" in generateClient({ authMode: '...' }) to the backend authorization ` +
					`rule's auth provider ('apiKey', 'userPool', 'iam', 'oidc', 'lambda')`;
			}
		});
	}
	return content;
}

function isUnauthError(error: any): boolean {
	// Error pattern corresponding to appsync calls
	if (error?.['originalError']?.['name']?.startsWith('UnauthorizedException')) {
		return true;
	}
	// Error pattern corresponding to appsync subscriptions
	if (
		error.message?.startsWith('Connection failed:') &&
		error.message?.includes('Permission denied')
	) {
		return true;
	}
	return false;
}
