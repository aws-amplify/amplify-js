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
	QueryArgs,
} from '../../types';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';

export type IndexMeta = {
	queryField: string;
	pk: string;
	sk?: string[];
};

export function indexQueryFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	indexMeta: IndexMeta,
	context = false,
) {
	const indexQueryWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		args: QueryArgs,
		options?: ListArgs,
	) => {
		return _indexQuery(
			client,
			modelIntrospection,
			model,
			indexMeta,
			{
				...args,
				...options,
			},
			contextSpec,
		);
	};

	const indexQuery = async (args: QueryArgs, options?: ListArgs) => {
		return _indexQuery(client, modelIntrospection, model, indexMeta, {
			...args,
			...options,
		});
	};

	return context ? indexQueryWithContext : indexQuery;
}

async function _indexQuery(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	indexMeta: IndexMeta,
	args?: ListArgs & AuthModeParams,
	contextSpec?: AmplifyServer.ContextSpec,
) {
	const { name } = model;

	const query = generateGraphQLDocument(
		modelIntrospection.models,
		name,
		'INDEX_QUERY',
		args,
		indexMeta,
	);
	const variables = buildGraphQLVariables(
		model,
		'INDEX_QUERY',
		args,
		modelIntrospection,
		indexMeta,
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
					headers,
			  )) as GraphQLResult<any>)
			: ((await (client as V6Client<Record<string, any>>).graphql(
					{
						...auth,
						query,
						variables,
					},
					headers,
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
						!!contextSpec,
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
