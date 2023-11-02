// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
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
			json(),
			typescript(cjsTSOptions),
			copy({
				targets: [
					{
						src: 'src/providers/s3/utils/client/runtime/package-cjs.json',
						dest: 'dist/cjs/providers/s3/utils/client/runtime',
						rename: 'package.json',
					},
				],
			}),
		],
	},
	// ESM config
	{
		input: input,
		output: emsOutput,
		plugins: [
			json(),
			typescript(emsTSOptions),
			copy({
				targets: [
					{
						src: 'src/providers/s3/utils/client/runtime/package-esm.json',
						dest: 'dist/esm/providers/s3/utils/client/runtime',
						rename: 'package.json',
					},
				],
			}),
		],
	},
]);

export default config;
