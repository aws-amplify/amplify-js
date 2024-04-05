// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';
import isEmpty from 'lodash/isEmpty.js';

import {
	authModeParams,
	buildGraphQLVariables,
	flattenItems,
	generateGraphQLDocument,
	getCustomHeaders,
	initializeModel,
} from '../APIClient';
import {
	AuthModeParams,
	ClientWithModels,
	GraphQLResult,
	ListArgs,
	QueryArgs,
	V6ClientSSRRequest,
} from '../../types';

import { handleListGraphQlError } from './utils';

export interface IndexMeta {
	queryField: string;
	pk: string;
	sk?: string[];
}

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

function processGraphQlResponse(
	result: GraphQLResult<any>,
	selectionSet: undefined | string[],
	modelInitializer: (flattenedResult: any[]) => any[],
) {
	const { data, extensions } = result;

	const [key] = Object.keys(data);

	if (data[key].items) {
		const flattenedResult = flattenItems(data)[key];

		return {
			data: selectionSet ? flattenedResult : modelInitializer(flattenedResult),
			nextToken: data[key].nextToken,
			extensions,
		};
	}

	return {
		data: data[key],
		nextToken: data[key].nextToken,
		extensions,
	};
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
		modelIntrospection,
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

	const auth = authModeParams(client, args);

	const modelInitializer = (flattenedResult: any[]) =>
		initializeModel(
			client,
			name,
			flattenedResult,
			modelIntrospection,
			auth.authMode,
			auth.authToken,
			!!contextSpec,
		);

	try {
		const headers = getCustomHeaders(client, args?.headers);

		const graphQlParams = {
			...auth,
			query,
			variables,
		};

		const requestArgs: [any, any] = [graphQlParams, headers];

		if (contextSpec !== undefined) {
			requestArgs.unshift(contextSpec);
		}

		const response = (await (
			client as V6ClientSSRRequest<Record<string, any>>
		).graphql(...requestArgs)) as GraphQLResult<any>;

		if (response.data !== undefined) {
			return processGraphQlResponse(
				response,
				args?.selectionSet,
				modelInitializer,
			);
		}
	} catch (error: any) {
		/**
		 * The `data` type returned by `error` here could be:
		 * 1) `null`
		 * 2) an empty object
		 * 3) "populated" but with a `null` value:
		 *   `data: { listByExampleId: null }`
		 * 4) an actual record:
		 *   `data: { listByExampleId: items: [{ id: '1', ...etc } }]`
		 */
		const { data, errors } = error;

		// `data` is not `null`, and is not an empty object:
		if (data !== undefined && !isEmpty(data) && errors) {
			const [key] = Object.keys(data);

			if (data[key]?.items) {
				const flattenedResult = flattenItems(data)[key];

				/**
				 * Check exists since `flattenedResult` could be `null`.
				 * if `flattenedResult` exists, result is an actual record.
				 */
				if (flattenedResult) {
					return {
						data: args?.selectionSet
							? flattenedResult
							: modelInitializer(flattenedResult),
						nextToken: data[key]?.nextToken,
					};
				}
			}

			// response is of type `data: { listByExampleId: null }`
			return {
				data: data[key],
				nextToken: data[key]?.nextToken,
			};
		} else {
			// `data` is `null` or an empty object:
			return handleListGraphQlError(error);
		}
	}
}
