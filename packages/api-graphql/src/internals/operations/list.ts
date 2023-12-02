// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
	authModeParams,
	getCustomHeaders,
} from '../APIClient';
import {
	AuthModeParams,
	ClientWithModels,
	ListArgs,
	V6Client,
	V6ClientSSRRequest,
	GraphQLResult,
} from '../../types';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';

export function listFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	context = false
) {
	const listWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		args?: ListArgs
	) => {
		return _list(client, modelIntrospection, model, args, contextSpec);
	};

	const list = async (args?: any) => {
		return _list(client, modelIntrospection, model, args);
	};

	return context ? listWithContext : list;
}

async function _list(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	args?: ListArgs & AuthModeParams,
	contextSpec?: AmplifyServer.ContextSpec
) {
	const { name } = model;

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

		const headers = getCustomHeaders(client, args?.headers);

		const { data, extensions } = !!contextSpec
			? ((await (client as V6ClientSSRRequest<Record<string, any>>).graphql(
					contextSpec,
					{
						...auth,
						query,
						variables,
					},
					headers
			  )) as GraphQLResult<any>)
			: ((await (client as V6Client<Record<string, any>>).graphql(
					{
						...auth,
						query,
						variables,
					},
					headers
			  )) as GraphQLResult<any>);

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
						!!contextSpec
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
	} catch (error: any) {
		if (error.errors) {
			// graphql errors pass through
			return error as any;
		} else {
			// non-graphql errors re re-thrown
			throw error;
		}
	}
}
