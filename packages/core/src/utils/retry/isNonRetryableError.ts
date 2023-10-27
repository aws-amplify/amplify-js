// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NonRetryableError } from './NonRetryableError';

export const isNonRetryableError = (obj: any): obj is NonRetryableError => {
	const key: keyof NonRetryableError = 'nonRetryable';
	return obj && obj[key];
};
