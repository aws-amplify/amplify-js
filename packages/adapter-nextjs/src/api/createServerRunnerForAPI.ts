// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { parseAmplifyConfig } from 'aws-amplify/utils';

import { createRunWithAmplifyServerContext, globalSettings } from '../utils';
import { NextServer } from '../types';

export const createServerRunnerForAPI = ({
	config,
}: NextServer.CreateServerRunnerInput): Omit<
	NextServer.CreateServerRunnerOutput,
	'createAuthRouteHandlers'
> & {
	resourcesConfig: ResourcesConfig;
} => {
	const amplifyConfig = parseAmplifyConfig(config);

	return {
		runWithAmplifyServerContext: createRunWithAmplifyServerContext({
			config: amplifyConfig,
			globalSettings,
		}),
		resourcesConfig: amplifyConfig,
	};
};
