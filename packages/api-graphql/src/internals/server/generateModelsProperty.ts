// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { graphQLOperationsInfo, ModelOperation } from '../APIClient';
import { ServerClientGenerationParams } from '../../types/';
import { V6ClientSSRRequest, V6ClientSSRCookies } from '../../types';

import { listFactory } from '../operations/list';
import { getFactory } from '../operations/get';

export function generateModelsProperty<
	T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>
>(client: ClientType, params: ServerClientGenerationParams): ClientType {
	// what about create?
	console.log(params);
	debugger;
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
