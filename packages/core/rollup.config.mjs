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

// Keep `tslib` a bare external specifier. With `importHelpers` enabled,
// downleveled helpers (e.g. for native `#private` fields) import from
// `tslib`; without this, rollup would bundle it and `preserveModules` would
// emit a nested `node_modules/tslib` copy that SSR bundlers (Nitro/Nuxt)
// fail to trace, causing ERR_MODULE_NOT_FOUND. tslib is a runtime dependency.
const external = [/^tslib(\/.*)?$/];

const config = defineConfig([
	// CJS config
	{
		input: input,
		external,
		output: cjsOutput,
		plugins: [typescript(cjsTSOptions)],
	},
	// ESM config
	{
		input: input,
		external,
		output: esmOutput,
		plugins: [typescript(esmTSOptions)],
	},
]);

export default config;
