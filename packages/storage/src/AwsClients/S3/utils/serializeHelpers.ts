// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type Serializable = string;

/**
 * Ref: https://github.com/aws/aws-sdk-js-v3/blob/7ed7101dcc4e81038b6c7f581162b959e6b33a04/clients/client-s3/src/protocols/Aws_restXml.ts#L12928
 *
 * @internal
 */
export const assignSerializableHeaderValues = (
	values: Record<string, any>
): Record<string, string> => {
	const isSerializable = (value: any): value is Serializable =>
		value != null &&
		value !== '' &&
		(!value.hasOwnProperty('length') || value.length) &&
		(!value.hasOwnProperty('size') || value.size);
	const headerEntries = Object.entries(values).filter(([, value]) =>
		isSerializable(value)
	) as [string, Serializable][];
	return Object.fromEntries(headerEntries);
};

/**
 * Ref: https://github.com/aws/aws-sdk-js-v3/blob/aaff894f7840d199bae043594ca56e290d5f3deb/packages/smithy-client/src/object-mapping.ts#L272
 *
 * @internal
 */
export const assignQueryParameters = (
	values: Record<string, { toString: () => string } | undefined>
): Record<string, string> => {
	const queryParams = {};
	for (const [key, value] of Object.entries(values)) {
		if (value != null) {
			queryParams[key] = value.toString();
		}
	}
	return queryParams;
};
