// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const defaultTSConfigPath = './tsconfig.json';

export const cjsOutput = {
	dir: 'dist/cjs',
	format: 'cjs',
	entryFileNames: '[name].js',
	preserveModulesRoot: 'src',
};

export const cjsTSOptions = {
	outDir: 'dist/cjs',
	declaration: false, // declarations are handled by the ESM build
	sourceMap: true,
	tsconfig: defaultTSConfigPath,
};

export const emsOutput = {
	dir: 'dist/esm',
	format: 'es',
	entryFileNames: '[name].mjs',
	preserveModulesRoot: 'src',
};

export const emsTSOptions = {
	outDir: 'dist/esm',
	declaration: true,
	sourceMap: true,
	tsconfig: defaultTSConfigPath,
};
