// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { removeMultiple as removeMultipleInternal } from '../../providers/s3/apis/internal/removeMultiple';
import { RemoveMultipleInput } from '../types/inputs';
import { RemoveMultipleOperation } from '../types/outputs';

/**
 * @internal
 */
export const removeMultiple = (
	input: RemoveMultipleInput,
): RemoveMultipleOperation =>
	removeMultipleInternal(Amplify, input) as RemoveMultipleOperation;
