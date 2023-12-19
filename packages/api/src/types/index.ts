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
	GraphQLQuery,
	GraphQLSubscription,
	SelectionSet,
} from '@aws-amplify/api-graphql';
