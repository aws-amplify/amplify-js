// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { removeObjects as removeObjectsInternal } from '../../providers/s3/apis/internal/removeObjects';
import { RemoveObjectsInput } from '../types/inputs';
import { RemoveObjectsOutput } from '../types/outputs';

/**
 * @internal
 */
export const removeObjects = (
	input: RemoveObjectsInput,
): Promise<RemoveObjectsOutput> =>
	removeObjectsInternal(Amplify, input as any) as Promise<RemoveObjectsOutput>;
