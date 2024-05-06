// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '@aws-amplify/core';
import { parseAmplifyConfig } from '@aws-amplify/core/internals/utils';

import { createRunWithAmplifyServerContext } from '../utils';
import { NextServer } from '../types';

export const createServerRunnerForAPI = ({
	config,
}: NextServer.CreateServerRunnerInput): NextServer.CreateServerRunnerOutput & {
	resourcesConfig: ResourcesConfig;
} => {
	const amplifyConfig = parseAmplifyConfig(config);

	return {
		runWithAmplifyServerContext: createRunWithAmplifyServerContext({
			config: amplifyConfig,
		}),
		resourcesConfig: amplifyConfig,
	};
};
