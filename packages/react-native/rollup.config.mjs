// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
		output: cjsOutput,
		plugins: [
			typescript({
				...cjsTSOptions,
				tsconfig: 'tsconfig.build.json',
			}),
		],
	},
	// ESM config
	{
		input: input,
		output: emsOutput,
		plugins: [
			typescript({
				...emsTSOptions,
				tsconfig: 'tsconfig.build.json',
			}),
		],
	},
]);

export default config;
