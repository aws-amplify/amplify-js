// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ModelTypes } from '@aws-amplify/amplify-api-next-types-alpha';
import { graphQLOperationsInfo, ModelOperation } from '../APIClient';
import { ServerClientGenerationParams } from '../../types/';
import { V6Client } from '../../types';

import { listFactory } from '../operations/list';
import { getFactory } from '../operations/get';

export function generateModelsProperty<T extends Record<any, any> = never>(
	client: V6Client,
	params: ServerClientGenerationParams
): ModelTypes<T> {
	const models = {} as any;
	const config = params.config;
	const useContext = client === null;

	if (!config) {
		// TODO: improve
		throw new Error('generateModelsProperty cannot retrieve Amplify config');
	}

	const modelIntrospection = config.API?.GraphQL?.modelIntrospection;
	if (!modelIntrospection) {
		return {} as any;
	}

	const SSR_UNSUPORTED_OPS = [
		'ONCREATE',
		'ONUPDATE',
		'ONDELETE',
		'OBSERVE_QUERY',
	];

	for (const model of Object.values(modelIntrospection.models)) {
		const { name } = model as any;
		models[name] = {} as any;

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
						useContext
					);
				} else {
					models[name][operationPrefix] = getFactory(
						client,
						modelIntrospection,
						model,
						operation,
						useContext
					);
				}
			}
		);
	}

	return models;
}
