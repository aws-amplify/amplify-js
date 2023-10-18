// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const deepFreeze = (object: any) => {
	const propNames = Reflect.ownKeys(object);

	for (const name of propNames) {
		const value = object[name];

		if ((value && typeof value === 'object') || typeof value === 'function') {
			deepFreeze(value);
		}
	}

	return Object.freeze(object);
};
