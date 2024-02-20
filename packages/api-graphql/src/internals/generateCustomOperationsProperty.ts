// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomQueries, CustomMutations } from '@aws-amplify/data-schema-types';
import { V6Client, __authMode, __authToken } from '../types';

import { customOpFactory } from './operations/custom';
import {
	ModelIntrospectionSchema,
	GraphQLProviderConfig,
} from '@aws-amplify/core/internals/utils';

type OpTypes = 'queries' | 'mutations';

type CustomOpsProperty<
	T extends Record<any, any>,
	OpType extends OpTypes,
> = OpType extends 'queries' ? CustomQueries<T> : CustomMutations<T>;

const operationTypeMap = {
	queries: 'query',
	mutations: 'mutation',
} as const;

export function generateCustomOperationsProperty<
	T extends Record<any, any>,
	OpType extends OpTypes,
>(
	client: V6Client<Record<string, any>>,
	config: GraphQLProviderConfig['GraphQL'],
	operationsType: OpType
): OpType extends 'queries' ? CustomQueries<T> : CustomMutations<T> {
	if (!config) {
		// breaks compatibility with certain bundler, e.g. Vite where component files are evaluated before
		// the entry point causing false positive errors. Revisit how to better handle this post-launch

		// throw new Error(
		// 	'The API configuration is missing. This is likely due to Amplify.configure() not being called
		// prior to generateClient().'
		// );
		return {} as CustomOpsProperty<T, OpType>;
	}

	const modelIntrospection: ModelIntrospectionSchema | undefined =
		config.modelIntrospection;

	if (!modelIntrospection) {
		return {} as CustomOpsProperty<T, OpType>;
	}

	const ops = {} as CustomOpsProperty<T, OpType>;
	for (const operation of Object.values(modelIntrospection[operationsType])) {
		// There's no common ancestry between CustomOpsProperty (CustomQueries, CustomMutations)
		// and the model introspection schema, and no way to ensure the types *actually* match.
		// They *should* match as long as the customer is using types from the gen2 schema builder
		// and the config generated from gen2.
		(ops as any)[operation.name] = customOpFactory(
			client,
			modelIntrospection,
			operationTypeMap[operationsType],
			operation
		);
	}

	return ops;
}

export function generateCustomMutationsProperty<T extends Record<any, any>>(
	client: V6Client<Record<string, any>>,
	config: GraphQLProviderConfig['GraphQL']
) {
	return generateCustomOperationsProperty<T, 'mutations'>(
		client,
		config,
		'mutations'
	);
}

export function generateCustomQueriesProperty<T extends Record<any, any>>(
	client: V6Client<Record<string, any>>,
	config: GraphQLProviderConfig['GraphQL']
) {
	return generateCustomOperationsProperty<T, 'queries'>(
		client,
		config,
		'queries'
	);
}
