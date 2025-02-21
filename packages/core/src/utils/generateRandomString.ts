// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCrypto } from './globalHelpers';

export const generateRandomString = (length: number) => {
	const STATE_CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const result: string[] = [];
	const randomNums = new Uint8Array(length);

	getCrypto().getRandomValues(randomNums);

	for (const num of randomNums) {
		result.push(STATE_CHARSET[num % STATE_CHARSET.length]);
	}

	return result.join('');
};
