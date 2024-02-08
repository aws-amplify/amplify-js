// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	SchemaModel,
	ModelAttribute,
	SecondaryIndexAttribute,
} from '@aws-amplify/core/internals/utils';

const attributeIsSecondaryIndex = (
	attr: ModelAttribute,
): attr is SecondaryIndexAttribute => {
	return (
		attr.type === 'key' &&
		// presence of `name` property distinguishes GSI from primary index
		attr.properties?.name &&
		attr.properties?.queryField &&
		attr.properties?.fields.length > 0
	);
};

export const getSecondaryIndexesFromSchemaModel = (model: SchemaModel) => {
	const idxs = model.attributes
		?.filter(attributeIsSecondaryIndex)
		.map((attr: SecondaryIndexAttribute) => {
			const queryField: string = attr.properties.queryField;
			const [pk, ...sk] = attr.properties.fields;

			return {
				queryField,
				pk,
				sk,
			};
		});

	return idxs || [];
};
