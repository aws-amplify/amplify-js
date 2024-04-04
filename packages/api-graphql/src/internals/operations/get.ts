// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';
import isEmpty from 'lodash/isEmpty.js';

import {
	ModelOperation,
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
	GraphQLOptionsV6,
	GraphQLResult,
	ListArgs,
	QueryArgs,
	V6Client,
	V6ClientSSRRequest,
} from '../../types';

import { handleSingularGraphQlError } from './utils';

export function getFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	operation: ModelOperation,
	useContext = false,
) {
	const getWithContext = async (
		contextSpec: AmplifyServer.ContextSpec & GraphQLOptionsV6<unknown, string>,
		arg?: any,
		options?: any,
	) => {
		return _get(
			client,
			modelIntrospection,
			model,
			arg,
			options,
			operation,
			contextSpec,
		);
	};

	const get = async (arg?: any, options?: any) => {
		return _get(client, modelIntrospection, model, arg, options, operation);
	};

	return useContext ? getWithContext : get;
}

async function _get(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	arg: QueryArgs,
	options: AuthModeParams & ListArgs,
	operation: ModelOperation,
	context?: AmplifyServer.ContextSpec,
) {
	const { name } = model;

	const query = generateGraphQLDocument(
		modelIntrospection,
		name,
		operation,
		options,
	);
	const variables = buildGraphQLVariables(
		model,
		operation,
		arg,
		modelIntrospection,
	);

	const auth = authModeParams(client, options);

	try {
		const headers = getCustomHeaders(client, options?.headers);

		const { data, extensions } = context
			? ((await (client as V6ClientSSRRequest<Record<string, any>>).graphql(
					context,
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
		if (data) {
			const [key] = Object.keys(data);
			const flattenedResult = flattenItems(data)[key];

			if (options?.selectionSet) {
				return { data: flattenedResult, extensions };
			} else {
				// TODO: refactor to avoid destructuring here
				const [initialized] = initializeModel(
					client,
					name,
					[flattenedResult],
					modelIntrospection,
					auth.authMode,
					auth.authToken,
					!!context,
				);

				return { data: initialized, extensions };
			}
		} else {
			return { data: null, extensions };
		}
	} catch (error: any) {
		/**
		 * The `data` type returned by `error` here could be:
		 * 1) `null`
		 * 2) an empty object
		 * 3) "populated" but with a `null` value `{ getPost: null }`
		 * 4) an actual record `{ getPost: { id: '1', title: 'Hello, World!' } }`
		 */
		const { data, errors } = error;

		/**
		 * `data` is not `null`, and is not an empty object:
		 */
		if (data && !isEmpty(data) && errors) {
			const [key] = Object.keys(data);
			const flattenedResult = flattenItems(data)[key];

			/**
			 * `flattenedResult` could be `null` here (e.g. `data: { getPost: null }`)
			 * if `flattenedResult`, result is an actual record:
			 */
			if (flattenedResult) {
				if (options?.selectionSet) {
					return { data: flattenedResult, errors };
				} else {
					// TODO: refactor to avoid destructuring here
					const [initialized] = initializeModel(
						client,
						name,
						[flattenedResult],
						modelIntrospection,
						auth.authMode,
						auth.authToken,
						!!context,
					);

					return { data: initialized, errors };
				}
			} else {
				// was `data: { getPost: null }`)
				return handleSingularGraphQlError(error);
			}
		} else {
			// `data` is `null`:
			return handleSingularGraphQlError(error);
		}
	}
}
