// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadBase64, loadGetRandomValues } from '@aws-amplify/react-native';

import { AmplifyError } from '../../errors';

loadGetRandomValues();
const { encode, decode } = loadBase64();

export const getCrypto = () => {
	if (
		typeof crypto !== 'undefined' &&
		typeof crypto.getRandomValues === 'function'
	) {
		return crypto;
	}

	throw new AmplifyError({
		name: 'MissingPolyfill',
		message: 'Cannot resolve the `crypto` function from the environment.',
	});
};

export const getBtoa = () => {
	return encode;
};

export const getAtob = () => {
	return decode;
};
