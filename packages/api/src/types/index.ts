// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * This exports from the types directory is a temporary workaround, since Amplify CLI currently
 * generates code that relies on this import path https://github.com/aws-amplify/amplify-cli/issues/3863
 * This will be removed in future release when CLI and customers moves to recommeneded import styles.
 */
export {
	graphqlOperation,
	GraphQLAuthError,
	GraphQLResult,
	GRAPHQL_AUTH_MODE,
} from '@aws-amplify/api-graphql';

// Opaque type used for determining the graphql query type
declare const queryType: unique symbol;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type GraphQLQuery<T> = T & { readonly [queryType]: 'query' };
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type GraphQLSubscription<T> = T & {
	readonly [queryType]: 'subscription';
};
