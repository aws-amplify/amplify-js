// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { CopyInput, CopyOutput } from '../types';

import { copy as copyInternal } from './internal/copy';

export const copy = (input: CopyInput): Promise<CopyOutput> =>
	copyInternal(Amplify, input);
