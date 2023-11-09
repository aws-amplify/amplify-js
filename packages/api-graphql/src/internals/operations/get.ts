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
} from '../APIClient';
import {
	QueryArgs,
	V6Client,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
} from '../../types';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';

export function getFactory<
	T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>
>(
	client: V6Client | ClientType,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	operation: ModelOperation,
	context = false
) {
	const getWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		arg?: any,
		options?: any
	) => {
		return _get<T, ClientType>(
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
		return _get<T, ClientType>(
			client,
			modelIntrospection,
			model,
			arg,
			options,
			operation,
			context
		);
	};

	return context ? getWithContext : get;
}

async function _get<
	T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>
>(
	client: V6Client | ClientType,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	arg: QueryArgs,
	options,
	operation,
	context
) {
	const { name } = model as any;

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
		const { data, extensions } = context
			? ((await client.graphql(context, {
					...auth,
					query,
					variables,
			  })) as any)
			: ((await client.graphql({
					...auth,
					query,
					variables,
			  })) as any);

		// flatten response
		if (data !== undefined) {
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
					context
				);

				return { data: initialized, extensions };
			}
		} else {
			return { data: null, extensions };
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
