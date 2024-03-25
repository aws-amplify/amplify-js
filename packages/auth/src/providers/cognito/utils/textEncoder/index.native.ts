// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadBuffer } from '@aws-amplify/react-native';

import { TextEncoder } from './types';

export const textEncoder: TextEncoder = {
	convert(input) {
		const Buffer = loadBuffer();

		return new Buffer(input, 'utf8');
	},
};
