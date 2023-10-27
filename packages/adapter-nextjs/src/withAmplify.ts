// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { LegacyConfig } from 'aws-amplify/adapter-core';
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
 * @returns The updated `nextConfig`.
 */
export const withAmplify = (
	nextConfig: NextConfig,
	amplifyConfig: ResourcesConfig | LegacyConfig
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
