import Auth from '@aws-amplify/auth';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import {
	AuthModeStrategy,
	ModelAttributeAuthProperty,
	ModelAttributeAuthProvider,
	ModelAttributeAuthAllow,
} from '../types';

/**
 * Determines which auth provider should be used to evaluate a given auth rule.
 *
 * @param rule The auth rules to check
 * @returns The provider name to use.
 */
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

/**
 * Returns the given auth rules in order they should be attempted.
 *
 * In general, this means rules are sorted from most to least specific.
 * E.g., a user-provided function can perform highly specific, fine-grained
 * authorization, whereas an API key is very coarse. Similarly, owner-based auth
 * is fine-grained, authorizing an individual user to particular operations on
 * particular records. This is in contrast to public authorization, which is
 * non-sepcific to any individual user.
 *
 * SIDE EFFECT FREE: This function leaves the provided list intact.
 *
 * @param rules An array of auth rules.
 * @returns The sorted array of auth rules.
 */
function sortAuthRulesWithPriority(rules: ModelAttributeAuthProperty[]) {
	const allowSortPriority = [
		ModelAttributeAuthAllow.CUSTOM,
		ModelAttributeAuthAllow.OWNER,
		ModelAttributeAuthAllow.GROUPS,
		ModelAttributeAuthAllow.PRIVATE,
		ModelAttributeAuthAllow.PUBLIC,
	];
	const providerSortPriority = [
		ModelAttributeAuthProvider.FUNCTION,
		ModelAttributeAuthProvider.USER_POOLS,
		ModelAttributeAuthProvider.OIDC,
		ModelAttributeAuthProvider.IAM,
		ModelAttributeAuthProvider.API_KEY,
	];

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

/**
 * Given a list of auth rules and a user, returns the applicable rules.
 *
 * @param param0 `{rules, currentUser}` to compare.
 * @returns an array of the applicable rules.
 */
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
			case ModelAttributeAuthAllow.CUSTOM:
				// custom with no provider -> function
				if (
					!rule.provider ||
					rule.provider === ModelAttributeAuthProvider.FUNCTION
				) {
					authModes.add(GRAPHQL_AUTH_MODE.AWS_LAMBDA);
				}
				break;
			case ModelAttributeAuthAllow.GROUPS:
			case ModelAttributeAuthAllow.OWNER: {
				// We shouldn't attempt User Pool or OIDC if there isn't an authenticated user
				if (currentUser) {
					if (rule.provider === ModelAttributeAuthProvider.USER_POOLS) {
						authModes.add(GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS);
					} else if (rule.provider === ModelAttributeAuthProvider.OIDC) {
						authModes.add(GRAPHQL_AUTH_MODE.OPENID_CONNECT);
					}
				}
				break;
			}
			case ModelAttributeAuthAllow.PRIVATE: {
				// We shouldn't attempt private if there isn't an authenticated user
				if (currentUser) {
					// private with no provider means userPools
					if (
						!rule.provider ||
						rule.provider === ModelAttributeAuthProvider.USER_POOLS
					) {
						authModes.add(GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS);
					} else if (rule.provider === ModelAttributeAuthProvider.IAM) {
						authModes.add(GRAPHQL_AUTH_MODE.AWS_IAM);
					}
				}

				break;
			}
			case ModelAttributeAuthAllow.PUBLIC: {
				if (rule.provider === ModelAttributeAuthProvider.IAM) {
					authModes.add(GRAPHQL_AUTH_MODE.AWS_IAM);
				} else if (
					!rule.provider ||
					rule.provider === ModelAttributeAuthProvider.API_KEY
				) {
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

/**
 * Returns an array of auth modes to try based on the schema, model, and
 * authenticated user (or lack thereof). Rules are sourced from `getAuthRules`
 * and returned in the order they ought to be attempted.
 *
 * @see sortAuthRulesWithPriority
 * @see getAuthRules
 *
 * @param param0 The `{schema, modelName}` to inspect.
 * @returns A sorted array of auth modes to attempt.
 */
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
