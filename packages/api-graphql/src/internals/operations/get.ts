// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
	authModeParams,
	ModelOperation,
	getCustomHeaders,
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
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';

export function getFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	operation: ModelOperation,
	useContext = false
) {
	const getWithContext = async (
		contextSpec: AmplifyServer.ContextSpec & GraphQLOptionsV6<unknown, string>,
		arg?: any,
		options?: any
	) => {
		return _get(
			client,
			modelIntrospection,
			model,
			arg,
			options,
			operation,
			contextSpec
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
	context?: AmplifyServer.ContextSpec
) {
	const { name } = model;

	const query = generateGraphQLDocument(
		modelIntrospection.models,
		name,
		operation,
		options
	);
	const variables = buildGraphQLVariables(
		model,
		operation,
		arg,
		modelIntrospection
	);

	try {
		const auth = authModeParams(client, options);

		const headers = getCustomHeaders(client, options?.headers);

		const { data, extensions } = context
			? ((await (client as V6ClientSSRRequest<Record<string, any>>).graphql(
					context,
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
					!!context
				);

				return { data: initialized, extensions };
			}
		} else {
			return { data: null, extensions };
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
