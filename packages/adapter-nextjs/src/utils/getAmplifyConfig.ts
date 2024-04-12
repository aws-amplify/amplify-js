// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { LegacyConfig, AmplifyOutputs } from 'aws-amplify/adapter-core';
import { parseAWSExports } from '@aws-amplify/core/internals/utils';

export const getAmplifyConfig = (
	config: ResourcesConfig | LegacyConfig | AmplifyOutputs,
): ResourcesConfig =>
	Object.keys(config).some(key => key.startsWith('aws_'))
		? parseAWSExports(config)
		: (config as ResourcesConfig);
