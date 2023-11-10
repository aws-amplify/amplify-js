// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
	authModeParams,
	getAdditionalHeadersFromClient,
} from '../APIClient';

export function listFactory(
	client,
	modelIntrospection,
	model,
	context = false
) {
	const listWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		args?: any
	) => {
		return _list(client, modelIntrospection, model, args, contextSpec);
	};

	const list = async (args?: any) => {
		return _list(client, modelIntrospection, model, args, context);
	};

	return context ? listWithContext : list;
}

async function _list(client, modelIntrospection, model, args, context) {
	const { name } = model as any;

	const query = generateGraphQLDocument(
		modelIntrospection.models,
		name,
		'LIST',
		args
	);
	const variables = buildGraphQLVariables(
		model,
		'LIST',
		args,
		modelIntrospection
	);

	try {
		const auth = authModeParams(client, args);

		const headers = getAdditionalHeadersFromClient(client);

		// TODO: client headers
		debugger;

		const { data, extensions } = context
			? ((await client.graphql(
					context,
					{
						...auth,
						query,
						variables,
					},
					headers
			  )) as any)
			: ((await client.graphql(
					{
						...auth,
						query,
						variables,
					},
					headers
			  )) as any);

		// flatten response
		if (data !== undefined) {
			const [key] = Object.keys(data);

			if (data[key].items) {
				const flattenedResult = flattenItems(data)[key];

				// don't init if custom selection set
				if (args?.selectionSet) {
					return {
						data: flattenedResult,
						nextToken: data[key].nextToken,
						extensions,
					};
				} else {
					const initialized = initializeModel(
						client,
						name,
						flattenedResult,
						modelIntrospection,
						auth.authMode,
						auth.authToken,
						context
					);

					return {
						data: initialized,
						nextToken: data[key].nextToken,
						extensions,
					};
				}
			}

			return {
				data: data[key],
				nextToken: data[key].nextToken,
				extensions,
			};
		}
	} catch (error) {
		if (error.errors) {
			// graphql errors pass through
			return error as any;
		} else {
			// non-graphql errors re re-thrown
			throw error;
		}
	}
}
