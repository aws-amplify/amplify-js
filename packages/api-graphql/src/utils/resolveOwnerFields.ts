// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ResourcesConfig } from '@aws-amplify/core';

type GraphQLConfig = Exclude<ResourcesConfig['API'], undefined>['GraphQL'];
type ModelIntrospectionSchema = Exclude<
	Exclude<GraphQLConfig, undefined>['modelIntrospection'],
	undefined
>;
type Model = ModelIntrospectionSchema['models'][string];

type AuthAttribute = {
	type: 'auth';
	properties: {
		rules: AuthRule[];
	};
};

/**
 * Only the portions of an Auth rule we care about.
 */
type AuthRule = {
	allow: string;
	ownerField?: string;
};

/**
 * Given an introspection schema model, returns all owner fields.
 *
 * @param model Model from an introspection schema
 * @returns List of owner field names
 */
export function resolveOwnerFields(model: Model): string[] {
	const ownerFields = new Set<string>();
	for (const attr of model.attributes || []) {
		if (isAuthAttribute(attr)) {
			for (const rule of attr.properties.rules) {
				if (rule.allow === 'owner') {
					ownerFields.add(rule.ownerField || 'owner');
				}
			}
		}
	}
	return Array.from(ownerFields);
}

/**
 * Type guard that identifies an auth attribute with an attached rules list that
 * specifies an `allow` attribute at a minimum.
 *
 * @param attribute Any object. Ideally a model introspection schema model attribute
 * @returns True if given object is an auth attribute
 */
function isAuthAttribute(attribute: any): attribute is AuthAttribute {
	if (attribute?.type === 'auth') {
		if (typeof attribute?.properties === 'object') {
			if (Array.isArray(attribute?.properties?.rules)) {
				return (attribute?.properties?.rules as Array<any>).every(
					rule => !!rule.allow
				);
			}
		}
	}
	return false;
}
