// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { remove as removeInternal } from '../../providers/s3/apis/internal/remove';
import { RemoveInput } from '../types/inputs';

/**
 * @internal
 */
export const remove = (input: RemoveInput) => {
	// return removeInternal(Amplify, input) as unknown as RemoveOperation;
	return removeInternal(Amplify, input);
};
