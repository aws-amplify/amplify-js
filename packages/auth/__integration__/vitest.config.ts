// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: [resolve(__dirname, './setup/vitest.setup.ts')],
		include: [resolve(__dirname, './**/*.test.ts')],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/__tests__/**',
			resolve(__dirname, '../__tests__/**'),
		],
		// Run tests sequentially to avoid Amplify singleton config conflicts
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
		// Polyfill globals for Node.js environment
		env: {
			NODE_OPTIONS: '--experimental-global-webcrypto',
		},
	},
	define: {
		'global.TextEncoder': 'TextEncoder',
		'global.TextDecoder': 'TextDecoder',
	},
});
