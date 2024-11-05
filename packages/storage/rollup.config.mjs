// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'rollup';
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
		output: cjsOutput,
		plugins: [typescript(cjsTSOptions)],
	},
	// ESM config
	{
		input: input,
		output: esmOutput,
		plugins: [typescript(esmTSOptions)],
	},
]);

export default config;
