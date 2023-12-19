// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { map } from 'rxjs';
import { V6Client, GraphqlSubscriptionResult } from '../../types';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	authModeParams,
	ModelOperation,
	getCustomHeaders,
} from '../APIClient';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';

export function subscriptionFactory(
	client: any,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	operation: ModelOperation
) {
	const { name } = model as any;

	const subscription = (args?: any) => {
		const query = generateGraphQLDocument(
			modelIntrospection.models,
			name,
			operation
		);
		const variables = buildGraphQLVariables(
			model,
			operation,
			args,
			modelIntrospection
		);

		const auth = authModeParams(client, args);

		const headers = getCustomHeaders(client, args?.headers);

		const observable = client.graphql(
			{
				...auth,
				query,
				variables,
			},
			headers
		) as GraphqlSubscriptionResult<object>;

		return observable.pipe(
			map(value => {
				const [key] = Object.keys(value.data);
				const data = (value.data as any)[key];
				const [initialized] = initializeModel(
					client as V6Client<Record<string, any>>,
					name,
					[data],
					modelIntrospection,
					auth.authMode,
					auth.authToken
				);
				return initialized;
			})
		);
	};

	return subscription;
}
