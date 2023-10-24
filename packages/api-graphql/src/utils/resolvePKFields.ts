// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ResourcesConfig } from '@aws-amplify/core';

type GraphQLConfig = Exclude<ResourcesConfig['API'], undefined>['GraphQL'];
type ModelIntrospectionSchema = Exclude<
	Exclude<GraphQLConfig, undefined>['modelIntrospection'],
	undefined
>;
type SchemaModel = ModelIntrospectionSchema['models'][string];

/**
 * Given a SchemaModel from a ModelIntrospectionSchema, returns the primary key
 * as an array of field names.
 *
 * @param model The model object
 * @returns Array of field names
 */
export function resolvePKFields(model: SchemaModel) {
	const { primaryKeyFieldName, sortKeyFieldNames } = model.primaryKeyInfo;
	return [primaryKeyFieldName, ...sortKeyFieldNames];
}
