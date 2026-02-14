// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: [resolve(__dirname, './setup/vitest.setup.ts')],
		include: [resolve(__dirname, '**/*.test.ts')],
		exclude: ['**/node_modules/**', '**/__tests__/**', '**/dist/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['**/*.test.ts'],
			exclude: ['**/*.d.ts', '**/node_modules/**'],
		},
	},
});
