// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { withAmplify } from '../src/withAmplify';

const mockAmplifyConfig: ResourcesConfig = {
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
const mockLegacyConfig = {
	aws_project_region: 'us-west-2',
	aws_cognito_identity_pool_id: 'aws_cognito_identity_pool_id',
	aws_cognito_region: 'aws_cognito_region',
	aws_user_pools_id: 'aws_user_pools_id',
	aws_user_pools_web_client_id: 'aws_user_pools_web_client_id',
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
};

describe('withAmplify', () => {
	it('should add amplifyConfig to nextConfig.env', () => {
		const nextConfig = {};
		const result = withAmplify(nextConfig, mockAmplifyConfig);

		expect(result).toEqual({
			env: {
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
			serverRuntimeConfig: {
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
		});
	});

	it('should add amplifyConfig (legacy CLI shaped) to nextConfig.env', () => {
		const nextConfig = {};
		const result = withAmplify(nextConfig, mockLegacyConfig);

		expect(result).toEqual({
			env: {
				amplifyConfig: JSON.stringify(mockLegacyConfig),
			},
			serverRuntimeConfig: {
				amplifyConfig: JSON.stringify(mockLegacyConfig),
			},
		});
	});

	it('should merge amplifyConfig to nextConfig.env (if this key has already defined)', () => {
		const nextConfig = {
			env: {
				existingKey: '123',
			},
			serverRuntimeConfig: {
				myKey: 'myValue',
			},
		};
		const result = withAmplify(nextConfig, mockAmplifyConfig);

		expect(result).toEqual({
			env: {
				existingKey: '123',
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
			serverRuntimeConfig: {
				myKey: 'myValue',
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
		});
	});
});
