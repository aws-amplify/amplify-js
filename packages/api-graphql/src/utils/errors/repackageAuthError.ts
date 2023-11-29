import { GraphQLError } from 'graphql';
import { GraphQLResult } from '../../types';

type ErrorObject = {
	errors: GraphQLError[];
};

export function repackageUnauthError<T extends ErrorObject>(content: T): T {
	if (content.errors && Array.isArray(content.errors)) {
		content.errors.forEach(e => {
			if (isUnauthError(e)) {
				e.message =
					`UnauthorizedError: If you're calling an Amplify-generated API, make sure ` +
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
