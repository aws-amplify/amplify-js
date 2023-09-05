// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { GetUrlRequest } from '../../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../../types';
import { getUrl as getUrlInternal } from '../internal/getUrl';

export const getUrl = async (
	contextSpec: AmplifyServer.ContextSpec,
	getUrlRequest: GetUrlRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> => {
	return getUrlInternal(
		getAmplifyServerContext(contextSpec).amplify,
		getUrlRequest
	);
};
