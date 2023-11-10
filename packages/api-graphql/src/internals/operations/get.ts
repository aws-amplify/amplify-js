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

export function getFactory(
	client,
	modelIntrospection,
	model,
	operation,
	context = false
) {
	const getWithContext = async (
		contextSpec: AmplifyServer.ContextSpec,
		arg?: any,
		options?: any
	) => {
		console.log(arg);
		console.log(options);
		debugger;
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
		console.log(arg);
		console.log(options);
		debugger;
		return _get(
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

async function _get(
	client,
	modelIntrospection,
	model,
	arg,
	options,
	operation,
	context
) {
	console.log(arg);
	console.log(options);
	debugger;
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

		let headers = getAdditionalHeadersFromClient(client);
		debugger;

		// individual request headers should take precedence over client headers:
		if (arg?.headers) {
			debugger;
			headers = arg?.headers;
		}

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
