const outputConfig = {
	sortNodes: true,
	respectPreserveConstEnum: true,
	noBanner: true,
};

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
	compilationOptions: {
		preferredConfigPath: '../../packages/tsconfig.base.json',
	},
	entries: [
		{
			filePath: './pinpoint.d.ts',
			outFile: '../../packages/core/src/AwsClients/Pinpoint/types.ts',
			libraries: {
				inlinedLibraries: ['@aws-sdk/client-pinpoint'],
			},
			output: outputConfig,
		},
		{
			filePath: './cognito-identity.d.ts',
			outFile: '../../packages/core/src/AwsClients/CognitoIdentity/types.ts',
			libraries: {
				inlinedLibraries: ['@aws-sdk/client-cognito-identity'],
			},
			output: outputConfig,
		},
	],
};

module.exports = config;
