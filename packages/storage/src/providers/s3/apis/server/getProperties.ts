// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import {
	GetPropertiesInput,
	GetPropertiesOutput,
} from '~/src/providers/s3/types';
import { getProperties as getPropertiesInternal } from '~/src/providers/s3/apis/internal/getProperties';

export const getProperties = (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput> => {
	return getPropertiesInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	);
};
