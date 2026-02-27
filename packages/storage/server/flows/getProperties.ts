/* eslint-disable import/no-relative-packages */
/* eslint-disable import/no-extraneous-dependencies */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetPropertiesInput } from '../../src/providers/s3/types';
import {
	getPropertiesFlow,
	resolveGetPropertiesDependencies,
} from '../../foundation';

export const getProperties = async (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput | any,
	action?: StorageAction,
) => {
	const amplifyServerContext = getAmplifyServerContext(contextSpec);
	const dependencies = await resolveGetPropertiesDependencies(
		amplifyServerContext.amplify,
		input,
		action,
	);

	return getPropertiesFlow(input, dependencies, action);
};
