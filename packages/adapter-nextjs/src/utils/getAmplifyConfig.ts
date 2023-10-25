// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { parseAWSExports } from '@aws-amplify/core/internals/utils';
import { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';
import getConfig from 'next/config';

export const getAmplifyConfig = (): ResourcesConfig => {
	let configStr = process.env.amplifyConfig;

	// With a Next.js app that uses the Pages Router, the key-value pairs
	// listed under the `env` field in the `next.config.js` is not accessible
	// via process.env.<key> at some occasion. Using the following as a fallback
	// See: https://github.com/vercel/next.js/issues/39299
	if (!configStr) {
		const { serverRuntimeConfig } = getConfig() ?? {};
		configStr = serverRuntimeConfig?.amplifyConfig;
	}

	if (!configStr) {
		throw new AmplifyServerContextError({
			message: 'Amplify configuration is missing from `process.env`.',
			recoverySuggestion:
				'Ensure to use `withAmplify` function in your `next.config.js`.',
		});
	}

	const configObject = JSON.parse(configStr);

	// TODO(HuiSF): adds ResourcesConfig validation when it has one.
	return Object.keys(configObject).some(key => key.startsWith('aws_'))
		? parseAWSExports(configObject)
		: configObject;
};
