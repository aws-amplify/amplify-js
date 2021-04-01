import Auth from '@aws-amplify/auth';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import {
	AuthModeStrategy,
	ModelAttributeAuthProperty,
	ModelAttributeAuthProvider,
} from '../types';

function getProviderFromRule(
	rule: ModelAttributeAuthProperty
): ModelAttributeAuthProvider {
	// private with no provider means userPools
	if (rule.allow === 'private' && !rule.provider) {
		return ModelAttributeAuthProvider.USER_POOLS;
	}
	// public with no provider means apiKey
	if (rule.allow === 'public' && !rule.provider) {
		return ModelAttributeAuthProvider.API_KEY;
	}
	return rule.provider;
}

function sortAuthRulesWithPriority(rules: ModelAttributeAuthProperty[]) {
	const allowSortPriority = ['owner', 'groups', 'private', 'public'];
	const providerSortPriority = ['userPools', 'oidc', 'iam', 'apiKey'];

	return [...rules].sort(
		(a: ModelAttributeAuthProperty, b: ModelAttributeAuthProperty) => {
			if (a.allow === b.allow) {
				return (
					providerSortPriority.indexOf(getProviderFromRule(a)) -
					providerSortPriority.indexOf(getProviderFromRule(b))
				);
			}
			return (
				allowSortPriority.indexOf(a.allow) - allowSortPriority.indexOf(b.allow)
			);
		}
	);
}

function getAuthRules({
	rules,
	currentUser,
}: {
	rules: ModelAttributeAuthProperty[];
	currentUser: unknown;
}) {
	// Using Set to ensure uniqueness
	const authModes = new Set<GRAPHQL_AUTH_MODE>();

	rules.forEach(rule => {
		switch (rule.allow) {
			case 'groups':
			case 'owner': {
				// We shouldn't attempt User Pool or OIDC if there isn't an authenticated user
				if (currentUser) {
					if (rule.provider === 'userPools') {
						authModes.add(GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS);
					} else if (rule.provider === 'oidc') {
						authModes.add(GRAPHQL_AUTH_MODE.OPENID_CONNECT);
					}
				}
				break;
			}
			case 'private': {
				// We shouldn't attempt private if there isn't an authenticated user
				if (currentUser) {
					// private with no provider means userPools
					if (!rule.provider || rule.provider === 'userPools') {
						authModes.add(GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS);
					} else if (rule.provider === 'iam') {
						authModes.add(GRAPHQL_AUTH_MODE.AWS_IAM);
					}
				}

				break;
			}
			case 'public': {
				if (rule.provider === 'iam') {
					authModes.add(GRAPHQL_AUTH_MODE.AWS_IAM);
				} else if (!rule.provider || rule.provider === 'apiKey') {
					// public with no provider means apiKey
					authModes.add(GRAPHQL_AUTH_MODE.API_KEY);
				}
				break;
			}
			default:
				break;
		}
	});

	return Array.from(authModes);
}

export const multiAuthStrategy: AuthModeStrategy = async ({
	schema,
	modelName,
}) => {
	let currentUser;
	try {
		currentUser = await Auth.currentAuthenticatedUser();
	} catch (e) {
		// No current user
	}

	const { attributes } = schema.namespaces.user.models[modelName];

	if (attributes) {
		const authAttribute = attributes.find(attr => attr.type === 'auth');

		if (authAttribute.properties && authAttribute.properties.rules) {
			const sortedRules = sortAuthRulesWithPriority(
				authAttribute.properties.rules
			);

			return getAuthRules({ currentUser, rules: sortedRules });
		}
	}
	return [];
};
