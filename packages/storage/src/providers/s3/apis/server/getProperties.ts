// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { GetPropertiesInput, GetPropertiesOutput } from '../../types';
import { getProperties as getPropertiesInternal } from '../internal/getProperties';

export const getProperties = (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput
): Promise<GetPropertiesOutput> => {
	return getPropertiesInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input
	);
};
