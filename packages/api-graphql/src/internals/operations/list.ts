// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
	authModeParams,
} from '../APIClient';
import {
	ListArgs,
	V6Client,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
} from '../../types';
import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/internals/utils';

export function listFactory<
	T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>
>(
	client: V6Client | ClientType,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	context = false
) {
	const listWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		args?: ListArgs
	) => {
		return _list<T, ClientType>(
			client,
			modelIntrospection,
			model,
			args,
			contextSpec
		);
	};

	const list = async (args?: any) => {
		return _list<T, ClientType>(client, modelIntrospection, model, args);
	};

	return context ? listWithContext : list;
}

async function _list<
	T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>
>(
	client: V6Client | ClientType,
	modelIntrospection: ModelIntrospectionSchema,
	model: SchemaModel,
	args: ListArgs | undefined,
	contextSpec?: AmplifyServer.ContextSpec
) {
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

		const { data, extensions } = !!contextSpec
			? ((await client.graphql(contextSpec, {
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
						contextSpec
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
