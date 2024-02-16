// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ModelTypes } from '@aws-amplify/data-schema-types';
import { graphQLOperationsInfo, ModelOperation } from '../APIClient';
import { V6Client, __authMode, __authToken } from '../../types';
import { listFactory } from '../operations/list';
import { indexQueryFactory } from '../operations/indexQuery';
import { getFactory } from '../operations/get';
import { subscriptionFactory } from '../operations/subscription';
import { observeQueryFactory } from '../operations/observeQuery';
import {
	ModelIntrospectionSchema,
	GraphQLProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { getSecondaryIndexesFromSchemaModel } from '../clientUtils';

export function generateModelsProperty<T extends Record<any, any> = never>(
	client: V6Client<Record<string, any>>,
	apiGraphQLConfig: GraphQLProviderConfig['GraphQL'],
): ModelTypes<T> {
	const models = {} as any;

	const modelIntrospection: ModelIntrospectionSchema | undefined =
		apiGraphQLConfig.modelIntrospection;

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
						model,
					);
				} else if (SUBSCRIPTION_OPS.includes(operation)) {
					models[name][operationPrefix] = subscriptionFactory(
						client,
						modelIntrospection,
						model,
						operation,
					);
				} else if (operation === 'OBSERVE_QUERY') {
					models[name][operationPrefix] = observeQueryFactory(models, model);
				} else {
					models[name][operationPrefix] = getFactory(
						client,
						modelIntrospection,
						model,
						operation,
					);
				}
			},
		);

		const secondaryIdxs = getSecondaryIndexesFromSchemaModel(model);

		for (const idx of secondaryIdxs) {
			models[name][idx.queryField] = indexQueryFactory(
				client,
				modelIntrospection,
				model,
				idx,
			);
		}
	}

	return models;
}
