// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const { join } = require('path');

const outputConfig = {
	sortNodes: true,
	respectPreserveConstEnum: true,
	noBanner: true,
};

const baseTsConfigPath = join(
	__dirname,
	'..',
	'..',
	'packages',
	'tsconfig.base.json'
);
const corePackageSrcClientsPath = join(
	__dirname,
	'..',
	'..',
	'packages',
	'core',
	'src',
	'AwsClients'
);

const storagePackageSrcClientsPath = join(
	__dirname,
	'..',
	'..',
	'packages',
	'storage',
	'src',
	'AwsClients'
);
const authPackageSrcClientsPath = join(
	__dirname,
	'..',
	'..',
	'packages',
	'auth',
	'src',
	'providers',
	'cognito',
	'utils',
	'clients'
);

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
	compilationOptions: {
		preferredConfigPath: baseTsConfigPath,
	},
	entries: [
		{
			filePath: './pinpoint.d.ts',
			outFile: join(corePackageSrcClientsPath, 'Pinpoint', 'types.ts'),
			libraries: {
				inlinedLibraries: ['@aws-sdk/client-pinpoint'],
			},
			output: outputConfig,
		},
		{
			filePath: './cognito-identity.d.ts',
			outFile: join(corePackageSrcClientsPath, 'CognitoIdentity', 'types.ts'),
			libraries: {
				inlinedLibraries: ['@aws-sdk/client-cognito-identity'],
			},
			output: outputConfig,
		},
		{
			filePath: './s3.d.ts',
			outFile: join(storagePackageSrcClientsPath, 'S3', 'types.ts'),
			libraries: {
				inlinedLibraries: ['@aws-sdk/client-s3'],
			},
			output: outputConfig,
		},
		{
			filePath: './cognito-identity-provider.d.ts',
			outFile: join(authPackageSrcClientsPath, 'CognitoIdentityProvider', 'types.ts'),
			libraries: {
				inlinedLibraries: ['@aws-sdk/client-cognito-identity-provider'],
			},
			output: outputConfig,
		},
	],
};

module.exports = config;
