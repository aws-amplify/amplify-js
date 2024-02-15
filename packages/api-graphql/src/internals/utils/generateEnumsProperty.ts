// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ModelIntrospectionSchema,
	GraphQLProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { EnumTypes } from '@aws-amplify/data-schema-types';

export const generateEnumsProperty = <T extends Record<any, any> = never>(
	graphqlConfig: GraphQLProviderConfig['GraphQL'],
): EnumTypes<T> => {
	const modelIntrospection: ModelIntrospectionSchema | undefined =
		graphqlConfig.modelIntrospection;

	if (!modelIntrospection) {
		return {} as EnumTypes<never>;
	}

	const enums: {
		[EnumName: string]: {
			values: () => string[];
		};
	} = {};

	for (const [_, enumData] of Object.entries(modelIntrospection.enums)) {
		enums[enumData.name] = {
			values: () => enumData.values,
		};
	}

	return enums as EnumTypes<T>;
};
