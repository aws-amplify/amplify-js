// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getGlobalContext, hasGlobalContext } from '@aws-amplify/core';

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
		get(_target, prop, _receiver) {
			if (!hasGlobalContext()) {
				// Return a callable that throws on invocation, not on access
				return (..._args: unknown[]) => {
					throw new Error(
						'Amplify has not been configured. Call Amplify.configure() before using GraphQLAPI.',
					);
				};
			}
			const instance = createGraphQLAPI(getGlobalContext());

			return Reflect.get(instance, prop, instance);
		},
	},
);
