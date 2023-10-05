// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { __amplify, V6Client } from '@aws-amplify/api-graphql';
import {
	graphql as v6graphql,
	cancel as v6cancel,
	isCancelError as v6isCancelError,
} from '@aws-amplify/api-graphql/internals';
import { Amplify } from '@aws-amplify/core';

/**
 * Generates an API client that can work with models or raw GraphQL
 */
export function generateClient<
	T extends Record<any, any> = never
>(): V6Client<T> {
	const client: V6Client<any> = {
		[__amplify]: Amplify,
		graphql: v6graphql,
		cancel: v6cancel,
		isCancelError: v6isCancelError,
	};

	return client as V6Client<T>;
}
