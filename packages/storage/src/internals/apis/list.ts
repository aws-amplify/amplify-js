// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { list as listInternal } from '../../providers/s3/apis/internal/list';
import { ListAdvancedAPIInput } from '../types/inputs';

/**
 * @internal
 */
export function list(input?: ListAdvancedAPIInput) {
	return listInternal(Amplify, input ?? {});
}
