// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextEncoder } from './types';

export const textEncoder: TextEncoder = {
	convert(input) {
		return new TextEncoder().encode(input);
	},
};
