import {
	GraphQLAuthMode,
	GraphQLAuthModeKeys,
} from '@aws-amplify/core/internals/utils';

import { GraphQLAuthError } from '../types';

export function translateAuthMode(
	authModeStr: GraphQLAuthModeKeys,
	apiKey: string | undefined
): GraphQLAuthMode | undefined {
	switch (authModeStr) {
		case 'apiKey': {
			if (!apiKey) {
				throw new Error(GraphQLAuthError.NO_API_KEY);
			}
			return { type: 'apiKey', apiKey };
		}
		case 'jwt': {
			return { type: 'jwt', token: 'access' };
		}
		case 'iam': {
			return { type: 'iam' };
		}
		case 'custom': {
			return { type: 'custom' };
		}
	}
	return undefined;
}
