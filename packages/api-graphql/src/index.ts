// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getGlobalContext } from '@aws-amplify/core';

import * as events from './internals/events';
import { GraphQLAPIClass, createGraphQLAPI } from './GraphQLAPI';

export { events };

export {
	createGraphQLAPI,
	GraphQLAPIClass,
	graphqlOperation,
} from './GraphQLAPI';
export * from './types';

export { CONNECTION_STATE_CHANGE } from './Providers/constants';
export * from './internals/events/types';

// Backwards-compat: lazy singleton that defers to createGraphQLAPI(getGlobalContext())
export const GraphQLAPI = new Proxy(
	{} as InstanceType<typeof GraphQLAPIClass>,
	{
		get(_target, prop, receiver) {
			const instance = createGraphQLAPI(getGlobalContext());

			return Reflect.get(instance, prop, receiver);
		},
	},
);
