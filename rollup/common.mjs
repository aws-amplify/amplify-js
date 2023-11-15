// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import tsCompiler from 'ts-patch/compiler/typescript.js';
const defaultTSConfigPath = './tsconfig.build.json';

/** @type {import("rollup").OutputOptions}*/
export const cjsOutput = {
	dir: 'dist/cjs',
	format: 'cjs',
	entryFileNames: '[name].js',
	preserveModules: true,
	preserveModulesRoot: 'src',
	sourcemap: true,
};

export const cjsTSOptions = {
	outDir: 'dist/cjs',
	declaration: false, // declarations are handled by the ESM build
	module: 'CommonJS',
	sourceMap: false,
	tsconfig: defaultTSConfigPath,
	tsBuildInfoFile: 'dist/meta/cjs.tsbuildinfo',
	// Use ts-patch to transform ts files to leverage the tsconfig plugins
	// programmatically.
	typescript: tsCompiler,
};

/** @type {import("rollup").OutputOptions}*/
export const esmOutput = {
	dir: 'dist/esm',
	format: 'es',
	entryFileNames: '[name].mjs',
	preserveModules: true,
	preserveModulesRoot: 'src',
	sourcemap: true,
};

export const esmTSOptions = {
	outDir: 'dist/esm',
	declaration: true,
	sourceMap: false,
	tsconfig: defaultTSConfigPath,
	tsBuildInfoFile: 'dist/meta/cjs.tsbuildinfo',
	// Use ts-patch to transform ts files to leverage the tsconfig plugins
	// programmatically.
	typescript: tsCompiler,
};
