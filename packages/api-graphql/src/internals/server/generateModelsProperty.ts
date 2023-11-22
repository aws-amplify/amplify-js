// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ModelTypes } from '@aws-amplify/data-schema-types';
import {
	ModelOperation,
	graphQLOperationsInfo,
} from '~/src/internals/APIClient';
import {
	ServerClientGenerationParams,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
} from '~/src/types';
import { ModelIntrospectionSchema } from '@aws-amplify/core/internals/utils';
import { listFactory } from '~/src/internals/operations/list';
import { getFactory } from '~/src/internals/operations/get';

export function generateModelsProperty<
	_T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<Record<string, any>>
		| V6ClientSSRCookies<Record<string, any>> = V6ClientSSRCookies<
		Record<string, any>
	>,
>(client: ClientType, params: ServerClientGenerationParams): ClientType {
	const models = {} as any;
	const { config } = params;
	const useContext = params.amplify === null;

	if (!config) {
		throw new Error('generateModelsProperty cannot retrieve Amplify config');
	}

	if (!config.API?.GraphQL) {
		return {} as ModelTypes<never>;
	}

	const modelIntrospection: ModelIntrospectionSchema | undefined =
		config.API.GraphQL.modelIntrospection;

	if (!modelIntrospection) {
		return {} as ModelTypes<never>;
	}

	const SSR_UNSUPORTED_OPS = [
		'ONCREATE',
		'ONUPDATE',
		'ONDELETE',
		'OBSERVE_QUERY',
	];

	for (const model of Object.values(modelIntrospection.models)) {
		const { name } = model;
		models[name] = {} as Record<string, any>;

		Object.entries(graphQLOperationsInfo).forEach(
			([key, { operationPrefix }]) => {
				const operation = key as ModelOperation;

				// subscriptions are not supported in SSR
				if (SSR_UNSUPORTED_OPS.includes(operation)) return;

				if (operation === 'LIST') {
					models[name][operationPrefix] = listFactory(
						client,
						modelIntrospection,
						model,
						useContext,
					);
				} else {
					models[name][operationPrefix] = getFactory(
						client,
						modelIntrospection,
						model,
						operation,
						useContext,
					);
				}
			},
		);
	}

	return models;
}
