// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { RemoveRequest } from '../../../../types';
import { S3RemoveOptions, S3RemoveResult } from '../../types';
import { remove as removeInternal } from '../internal/remove';

export const remove = (
	contextSpec: AmplifyServer.ContextSpec,
	removeRequest: RemoveRequest<S3RemoveOptions>
): Promise<S3RemoveResult> => {
	return removeInternal(
		getAmplifyServerContext(contextSpec).amplify,
		removeRequest
	);
};
