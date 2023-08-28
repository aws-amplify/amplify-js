// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '@aws-amplify/core';
import { NextConfig } from 'next';

// NOTE: this function is exported from the subpath `/with-amplify`.
// The reason is that this function is called in the `next.config.js` which
// is not being transpiled by Next.js.

/**
 * Merges the `amplifyConfig` into the `nextConfig.env`.
 * @param nextConfig The next config for a Next.js app.
 * @param amplifyConfig
 * @returns The updated `nextConfig`.
 */
export const withAmplify = (
	nextConfig: NextConfig,
	amplifyConfig: ResourcesConfig
) => {
	nextConfig.env = {
		...nextConfig.env,
		// TODO(Hui): follow up the validation of the amplifyConfig.
		amplifyConfig: JSON.stringify(amplifyConfig),
	};

	return nextConfig;
};
