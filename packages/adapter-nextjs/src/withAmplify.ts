// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'path';
import * as fs from 'fs';
import { parseAmplifyConfig } from 'aws-amplify';
import { NextConfig } from 'next';
import { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';

const configTextRegex = /const awsmobile = ({.*});/s;
const nextCommands = ['build', 'dev', 'export', 'start'];

// NOTE: this function is exported from the subpath `/with-amplify`.
// The reason is that this function is called in the `next.config.js` which
// is not being transpiled by Next.js.

/**
 * Merges the `amplifyConfig` into the `nextConfig.env`.
 *
 * @param nextConfig The next config for a Next.js app.
 * @param configPath The relative path of the `aws-exports.js` file
 *
 * @returns The updated `nextConfig`.
 *
 * @example
 * const { withAmplify } = require('@aws-amplify/adapter-nextjs/with-amplify');
 * const nextConfig = {
 *   experimental: {
 *     serverActions: true,
 *   },
 * }
 * module.exports = withAmplify(nextConfig, './src/aws-exports.js');
 */
export const withAmplify = (nextConfig: NextConfig, configPath: string) => {
	const configStr = JSON.stringify(getAmplifyConfig(configPath));

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

const getAmplifyConfig = (configPath: string) => {
	try {
		const projectRoot = process.cwd();
		const resolvedPath = path.resolve(projectRoot, getDirArg(), configPath);
		const fileContent = fs.readFileSync(resolvedPath, 'utf8');
		const match = configTextRegex.exec(fileContent);

		if (match && match[1]) {
			// TODO(HuiSF): add handling when parseAmplifyConfig is not needed.
			const configObject = parseAmplifyConfig(JSON.parse(match[1]));

			return configObject;
		} else {
			throw new AmplifyServerContextError({
				message: 'The `awsmobile` object not found in the file.',
				recoverySuggestion:
					'Ensure the path parameter points to a correct aws-exports file.',
			});
		}
	} catch (error) {
		throw new AmplifyServerContextError({
			message: 'Cannot read or parse the `awsmobile` object.',
			recoverySuggestion:
				'Ensure the path parameter points to a correct aws-exports file.',
		});
	}
};

function getDirArg() {
	const lastArg = process.argv[process.argv.length - 1];
	return nextCommands.includes(lastArg) ? '' : lastArg;
}
