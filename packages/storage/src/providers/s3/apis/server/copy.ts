// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { CopyInput, CopyOutput } from '../../types';
import { copy as copyInternal } from '../internal/copy';

export const copy = async (
	contextSpec: AmplifyServer.ContextSpec,
	input: CopyInput
): Promise<CopyOutput> => {
	return copyInternal(getAmplifyServerContext(contextSpec).amplify, input);
};
