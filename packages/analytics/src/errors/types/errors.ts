import { AmplifyErrorMap } from '@aws-amplify/core';

export enum AnalyticsValidationErrorCode {
	InvalidAnalyticsConfiguration = 'InvalidAnalyticsConfiguration',
	NoCredentials = 'NoCredentials'
};

export const validationErrorMap: AmplifyErrorMap<AnalyticsValidationErrorCode> = {
	[AnalyticsValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty'
	},
	[AnalyticsValidationErrorCode.InvalidAnalyticsConfiguration]: {
		message: 'Invalid Analytics configuration (appId & region are required)'
	},
};
