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
	V6Client,
	V6ClientSSRRequest,
} from '../../types';

import { handleListGraphQlError } from './utils';

export function listFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	context = false,
) {
	const listWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		args?: ListArgs,
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
	contextSpec?: AmplifyServer.ContextSpec,
) {
	const { name } = model;

	const query = generateGraphQLDocument(modelIntrospection, name, 'LIST', args);
	const variables = buildGraphQLVariables(
		model,
		'LIST',
		args,
		modelIntrospection,
	);

	const auth = authModeParams(client, args);

	try {
		const headers = getCustomHeaders(client, args?.headers);

		const { data, extensions } = contextSpec
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
		/**
		 * The `data` type returned by `error` here could be:
		 * 1) `null`
		 * 2) an empty array
		 * 3) "populated" but with a `null` value `{ getPost: null }`
		 * 4) an actual record `{ getPost: { id: '1', title: 'Hello, World!' } }`
		 */
		const { data, errors } = error;

		/**
		 * `data` is not `null`, and is not an empty array:
		 */
		if (data !== undefined && !isEmpty(data) && errors) {
			const [key] = Object.keys(data);

			if (data[key].items) {
				const flattenedResult = flattenItems(data)[key];

				/**
				 * `flattenedResult` could be `null` here (e.g. `data: { getPost: null }`)
				 * if `flattenedResult`, result is an actual record:
				 */
				if (flattenedResult) {
					// don't init if custom selection set
					if (args?.selectionSet) {
						return {
							data: flattenedResult,
							nextToken: data[key].nextToken,
							errors,
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
							errors,
						};
					}
				}

				return {
					data: data[key],
					nextToken: data[key].nextToken,
					errors,
				};
			} else {
				// was `data: { getPost: null }`)
				return handleListGraphQlError(error);
			}
		} else {
			// `data` is `null`:
			return handleListGraphQlError(error);
		}
	}
}
