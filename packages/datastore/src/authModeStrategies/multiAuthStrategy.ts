// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { fetchAuthSession } from '@aws-amplify/core';
import {
	AuthModeStrategy,
	ModelAttributeAuthProperty,
	ModelAttributeAuthProvider,
	ModelAttributeAuthAllow,
	AmplifyContext,
} from '../types';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

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
	return rule.provider!;
}

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

function getAuthRules({
	rules,
	currentUser,
}: {
	rules: ModelAttributeAuthProperty[];
	currentUser: unknown;
}) {
	// Using Set to ensure uniqueness
	const authModes = new Set<GraphQLAuthMode>();

	rules.forEach(rule => {
		switch (rule.allow) {
			case ModelAttributeAuthAllow.CUSTOM:
				// custom with no provider -> function
				if (
					!rule.provider ||
					rule.provider === ModelAttributeAuthProvider.FUNCTION
				) {
					authModes.add('lambda');
				}
				break;
			case ModelAttributeAuthAllow.GROUPS:
			case ModelAttributeAuthAllow.OWNER: {
				// We shouldn't attempt User Pool or OIDC if there isn't an authenticated user
				if (currentUser) {
					if (rule.provider === ModelAttributeAuthProvider.USER_POOLS) {
						authModes.add('userPool');
					} else if (rule.provider === ModelAttributeAuthProvider.OIDC) {
						authModes.add('oidc');
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
						authModes.add('userPool');
					} else if (rule.provider === ModelAttributeAuthProvider.IAM) {
						authModes.add('iam');
					}
				}

				break;
			}
			case ModelAttributeAuthAllow.PUBLIC: {
				if (rule.provider === ModelAttributeAuthProvider.IAM) {
					authModes.add('iam');
				} else if (
					!rule.provider ||
					rule.provider === ModelAttributeAuthProvider.API_KEY
				) {
					// public with no provider means apiKey
					authModes.add('apiKey');
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
export const multiAuthStrategy: (
	amplifyContext: AmplifyContext
) => AuthModeStrategy =
	(amplifyContext: AmplifyContext) =>
	async ({ schema, modelName }) => {
		let currentUser;
		try {
			const authSession = await fetchAuthSession();
			if (authSession.tokens.accessToken) {
				// the user is authenticated
				currentUser = authSession;
			}
		} catch (e) {
			// No current user
		}

		const { attributes } = schema.namespaces.user.models[modelName];

		if (attributes) {
			const authAttribute = attributes.find(attr => attr.type === 'auth');

			if (authAttribute?.properties?.rules) {
				const sortedRules = sortAuthRulesWithPriority(
					authAttribute.properties.rules
				);

				return getAuthRules({ currentUser, rules: sortedRules });
			}
		}
		return [];
	};
