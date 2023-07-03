// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoKeys } from './types';

export function getCognitoKeys<T extends Record<string, string>>(
	cognitoKeys: T
) {
	const keys = Object.values({ ...cognitoKeys });

	return (prefix: string, identifier: string) =>
		keys.reduce(
			(acc, cognitoKey) => ({
				...acc,
				[cognitoKey]: `${prefix}.${identifier}.${cognitoKey}`,
			}),
			{} as CognitoKeys<keyof T & string>
		);
}
