// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import {
	StorageOperationRequest,
	StorageRemoveOptions,
	StorageRemoveResult,
} from '../../../../';
import { remove as removeInternal } from '../internal/remove';

export const remove = (
	contextSpec: AmplifyServer.ContextSpec,
	req: StorageOperationRequest<StorageRemoveOptions>
): Promise<StorageRemoveResult> => {
	return removeInternal(getAmplifyServerContext(contextSpec).amplify, req);
};
