// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import getConfig from 'next/config';
import { parseAWSExports } from '@aws-amplify/core/internals/utils';
import { getAmplifyConfig } from '../../src/utils/getAmplifyConfig';

jest.mock('next/config');
jest.mock('@aws-amplify/core/internals/utils');

const mockGetConfig = getConfig as jest.Mock;
const mockParseAWSExports = parseAWSExports as jest.Mock;

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

	beforeEach(() => {
		mockGetConfig.mockReturnValue({});
		delete process.env.amplifyConfig;
	});

	it('should return amplifyConfig from env vars', () => {
		process.env.amplifyConfig = JSON.stringify(mockAmplifyConfig);

		const result = getAmplifyConfig();
		expect(result).toEqual(mockAmplifyConfig);
	});

	it('should invoke parseAWSConfig when using the legacy shaped config', () => {
		process.env.amplifyConfig = JSON.stringify(mockLegacyConfig);

		getAmplifyConfig();
		expect(mockParseAWSExports).toHaveBeenCalledWith(mockLegacyConfig);
	});

	it('should attempt to get amplifyConfig via getConfig provided by Next.js as a fallback', () => {
		mockGetConfig.mockReturnValueOnce({
			serverRuntimeConfig: {
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
		});

		const result = getAmplifyConfig();
		expect(result).toEqual(mockAmplifyConfig);
	});

	it('should throw error when amplifyConfig is not found from env vars', () => {
		mockGetConfig.mockReturnValueOnce(undefined);
		expect(() => getAmplifyConfig()).toThrow();
	});
});
