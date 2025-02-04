// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '../index';
import { AmplifyOutputsUnknown } from '../singleton/AmplifyOutputs/types';
import { LegacyConfig } from '../singleton/types';
import { parseAWSExports } from '../parseAWSExports';
import { isAmplifyOutputs, parseAmplifyOutputs } from '../parseAmplifyOutputs';

/**
 * Parses the variety of configuration shapes that Amplify can accept into a ResourcesConfig.
 *
 * @param amplifyConfig An Amplify configuration object conforming to one of the supported schemas.
 * @return A ResourcesConfig for the provided configuration object.
 */
export const parseAmplifyConfig = (
	amplifyConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
): ResourcesConfig => {
	if (Object.keys(amplifyConfig).some(key => key.startsWith('aws_'))) {
		return parseAWSExports(amplifyConfig);
	} else if (isAmplifyOutputs(amplifyConfig)) {
		return parseAmplifyOutputs(amplifyConfig);
	} else {
		return amplifyConfig as ResourcesConfig;
	}
};
