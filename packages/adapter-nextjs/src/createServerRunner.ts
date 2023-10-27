// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '@aws-amplify/core';
import { parseAWSExports } from '@aws-amplify/core/internals/utils';
import { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';
import { createRunWithAmplifyServerContext, getAmplifyConfig } from './utils';
import { NextServer } from './types';

let amplifyConfig: ResourcesConfig | undefined;

export const createServerRunner: NextServer.CreateServerRunner = ({
	config,
}) => {
	if (amplifyConfig) {
		throw new AmplifyServerContextError({
			message: '`createServerRunner` needs to be called only once.',
		});
	}

	amplifyConfig = getAmplifyConfig(config);

	return {
		runWithAmplifyServerContext: createRunWithAmplifyServerContext({
			config: amplifyConfig,
		}),
	};
};
