// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';

export const getAmplifyConfig = (): ResourcesConfig => {
	const configStr = process.env.amplifyConfig;

	if (!configStr) {
		throw new AmplifyServerContextError({
			message: 'Amplify configuration is missing from `process.env`.',
			recoverySuggestion:
				'Ensure to use `withAmplify` function in your `next.config.js`.',
		});
	}

	const configObject = JSON.parse(configStr);

	// TODO(HuiSF): adds ResourcesConfig validation when it has one.
	return configObject;
};
