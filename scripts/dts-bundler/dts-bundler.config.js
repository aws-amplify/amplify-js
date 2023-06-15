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
	],
};

module.exports = config;
