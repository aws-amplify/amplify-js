// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ModelTypes } from '@aws-amplify/data-schema-types';
import { graphQLOperationsInfo, ModelOperation } from './APIClient';
import { ClientGenerationParams } from './types';
import { V6Client, __authMode, __authToken } from '../types';

import { listFactory } from './operations/list';
import { getFactory } from './operations/get';
import { subscriptionFactory } from './operations/subscription';
import { observeQueryFactory } from './operations/observeQuery';
import { ModelIntrospectionSchema } from '@aws-amplify/core/internals/utils';

export function generateModelsProperty<T extends Record<any, any> = never>(
	client: V6Client<Record<string, any>>,
	params: ClientGenerationParams
): ModelTypes<T> {
	const models = {} as any;
	const config = params.amplify.getConfig();

	if (!config.API?.GraphQL) {
		// breaks compatibility with certain bundler, e.g. Vite where component files are evaluated before
		// the entry point causing false positive errors. Revisit how to better handle this post-launch

		// throw new Error(
		// 	'The API configuration is missing. This is likely due to Amplify.configure() not being called
		// prior to generateClient().'
		// );
		return {} as ModelTypes<never>;
	}

	const modelIntrospection: ModelIntrospectionSchema | undefined =
		config.API.GraphQL.modelIntrospection;

	if (!modelIntrospection) {
		return {} as ModelTypes<never>;
	}

	const SUBSCRIPTION_OPS = ['ONCREATE', 'ONUPDATE', 'ONDELETE'];

	for (const model of Object.values(modelIntrospection.models)) {
		const { name } = model;

		models[name] = {} as Record<string, any>;

		Object.entries(graphQLOperationsInfo).forEach(
			([key, { operationPrefix }]) => {
				const operation = key as ModelOperation;

				if (operation === 'LIST') {
					models[name][operationPrefix] = listFactory(
						client,
						modelIntrospection,
						model
					);
				} else if (SUBSCRIPTION_OPS.includes(operation)) {
					models[name][operationPrefix] = subscriptionFactory(
						client,
						modelIntrospection,
						model,
						operation
					);
				} else if (operation === 'OBSERVE_QUERY') {
					models[name][operationPrefix] = observeQueryFactory(models, model);
				} else {
					models[name][operationPrefix] = getFactory(
						client,
						modelIntrospection,
						model,
						operation
					);
				}
			}
		);
	}

	return models;
}
