// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig, parseAmplifyConfig } from 'aws-amplify';
import { NextConfig } from 'next';

// NOTE: this function is exported from the subpath `/with-amplify`.
// The reason is that this function is called in the `next.config.js` which
// is not being transpiled by Next.js.

/**
 * Merges the `amplifyConfig` into the `nextConfig.env`.
 *
 * @param nextConfig The next config for a Next.js app.
 * @param amplifyConfig The Amplify configuration.
 *
 *   **NOTE**: If you are using Amplify CLI to generate the `aws-exports.js`
 *   file, you need to use {@link parseAmplifyConfig} to reformat the configuration.
 *   E.g.
 *   ```javascript
 *   const { parseAmplifyConfig } = require('aws-amplify');
 *   const { withAmplify } = require('@aws-amplify/adapter-nextjs/with-amplify');
 *   const config = require('./src/aws-exports');
 *
 *   const nextConfig = {};
 *   module.exports = withAmplify(nextConfig, parseAmplifyConfig(config));
 *   ```
 * @returns The updated `nextConfig`.
 */
export const withAmplify = (
	nextConfig: NextConfig,
	amplifyConfig: ResourcesConfig
) => {
	const configStr = JSON.stringify(amplifyConfig);
	nextConfig.env = {
		...nextConfig.env,
		amplifyConfig: configStr,
	};

	nextConfig.serverRuntimeConfig = {
		...nextConfig.serverRuntimeConfig,
		amplifyConfig: configStr,
	};

	return nextConfig;
};
