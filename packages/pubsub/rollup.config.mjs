// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { getInputForGlob } from '../../rollup/utils.mjs';
import {
	cjsOutput,
	cjsTSOptions,
	esmOutput,
	esmTSOptions,
} from '../../rollup/common.mjs';

const input = getInputForGlob('src/**/*.ts');

const config = defineConfig([
	// CJS config
	{
		input: input,
		external: [
			fileURLToPath(new URL('src/vendor/paho-mqtt.js', import.meta.url)),
		],
		output: cjsOutput,
		plugins: [typescript(cjsTSOptions)],
	},
	// ESM config
	{
		input: input,
		output: esmOutput,
		plugins: [
			commonjs({
				include: ['src/vendor/paho-mqtt.js'],
				exclude: ['**/*.ts'],
			}),
			typescript(esmTSOptions),
		],
	},
]);

export default config;
