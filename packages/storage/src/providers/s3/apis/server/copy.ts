// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { CopyRequest } from '../../../../types';
import { S3CopyResult } from '../../types';
import { copy as copyInternal } from '../internal/copy';

export const copy = async (
	contextSpec: AmplifyServer.ContextSpec,
	copyRequest: CopyRequest
): Promise<S3CopyResult> => {
	return copyInternal(
		getAmplifyServerContext(contextSpec).amplify,
		copyRequest
	);
};
