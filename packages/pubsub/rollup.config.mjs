// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { getInputForGlob } from '../../rollup/utils.mjs';
import {
	cjsOutput,
	cjsTSOptions,
	emsOutput,
	emsTSOptions,
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
		external: [
			fileURLToPath(new URL('src/vendor/paho-mqtt.js', import.meta.url)),
		],
		output: emsOutput,
		plugins: [typescript(emsTSOptions)],
	},
]);

export default config;
