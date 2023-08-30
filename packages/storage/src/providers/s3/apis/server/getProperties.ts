// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { StorageOperationRequest, StorageOptions } from '../../../../types';
import { S3GetPropertiesResult } from '../../types';
import { getProperties as getPropertiesInternal } from '../internal/getProperties';

export const getProperties = (
	contextSpec: AmplifyServer.ContextSpec,
	req: StorageOperationRequest<StorageOptions>
): Promise<S3GetPropertiesResult> => {
	return getPropertiesInternal(
		getAmplifyServerContext(contextSpec).amplify,
		req
	);
};
