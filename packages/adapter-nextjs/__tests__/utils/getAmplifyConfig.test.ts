// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyConfig } from '../../src/utils/getAmplifyConfig';

describe('getAmplifyConfig', () => {
	const mockLegacyConfig = {
		aws_project_region: 'us-west-2',
		aws_cognito_identity_pool_id: '123',
		aws_cognito_region: 'aws_cognito_region',
		aws_user_pools_id: 'abc',
		aws_user_pools_web_client_id: 'def',
		oauth: {},
		aws_cognito_username_attributes: [],
		aws_cognito_social_providers: [],
		aws_cognito_signup_attributes: [],
		aws_cognito_mfa_configuration: 'OFF',
		aws_cognito_mfa_types: ['SMS'],
		aws_cognito_password_protection_settings: {
			passwordPolicyMinLength: 8,
			passwordPolicyCharacters: [],
		},
		aws_cognito_verification_mechanisms: ['PHONE_NUMBER'],
		aws_user_files_s3_bucket: 'bucket',
		aws_user_files_s3_bucket_region: 'us-east-1',
	};
	const mockAmplifyConfig = {
		Auth: {
			Cognito: {
				identityPoolId: '123',
				userPoolId: 'abc',
				userPoolClientId: 'def',
			},
		},
		Storage: {
			S3: {
				bucket: 'bucket',
				region: 'us-east-1',
			},
		},
	};

	it('returns config object that conforms to ResourcesConfig', () => {
		expect(getAmplifyConfig(mockLegacyConfig)).toMatchObject(mockAmplifyConfig);
	});
});
