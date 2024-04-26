// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '@aws-amplify/core';

import { createRunWithAmplifyServerContext, getAmplifyConfig } from '../utils';
import { NextServer } from '../types';

export const createServerRunnerForAPI = ({
	config,
	libraryOptions,
}: NextServer.CreateServerRunnerInput): NextServer.CreateServerRunnerOutput & {
	resourcesConfig: ResourcesConfig;
} => {
	const amplifyConfig = getAmplifyConfig(config);

	return {
		runWithAmplifyServerContext: createRunWithAmplifyServerContext({
			config: amplifyConfig,
			libraryOptions,
		}),
		resourcesConfig: amplifyConfig,
	};
};
