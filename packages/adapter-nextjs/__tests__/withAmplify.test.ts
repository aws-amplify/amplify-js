// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import * as path from 'path';
import { ResourcesConfig, parseAmplifyConfig } from 'aws-amplify';
import { withAmplify } from '../src/withAmplify';
import { AmplifyError } from '@aws-amplify/core/internals/utils';

jest.mock('fs');
jest.mock('path');
jest.mock('aws-amplify');

const legacyAmplifyConfig = {
	aws_project_region: 'us-west-2',
	aws_cognito_identity_pool_id: 'aws_cognito_identity_pool_id',
	aws_cognito_region: 'us-west-2',
	aws_user_pools_id: 'aws_user_pools_id',
	aws_user_pools_web_client_id: 'aws_user_pools_web_client_id',
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
	aws_user_files_s3_bucket: 'aws_user_files_s3_bucket',
	aws_user_files_s3_bucket_region: 'us-west-2',
	aws_mobile_analytics_app_id: 'aws_mobile_analytics_app_id',
	aws_mobile_analytics_app_region: 'us-west-2',
	Analytics: {
		AWSPinpoint: {
			appId: 'aws_mobile_analytics_app_id',
			region: 'us-west-2',
		},
	},
};
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
const mockLegacyConfigFileContent = `
const awsmobile = ${JSON.stringify(legacyAmplifyConfig, null, 2)};

export default awsmobile;
`;
const mockConfigPath = './src/aws-exports.js';
const mockCommandRoot = '/User/Developer/next-js-project';
const mockResolvedPath = `${mockCommandRoot}/${mockConfigPath}`;
const mockParseAmplifyConfig = parseAmplifyConfig as jest.Mock;
const mockCWD = jest.fn();
const mockPathResolve = path.resolve as jest.Mock;
const mockFSReadFileSync = fs.readFileSync as jest.Mock;

describe('withAmplify', () => {
	let originalCWD;
	let originalProcessArgv;

	beforeAll(() => {
		originalCWD = process.cwd;
		process.cwd = mockCWD;
	});

	afterAll(() => {
		process.cwd = originalCWD;
	});

	beforeEach(() => {
		mockCWD.mockReturnValue(mockCommandRoot);
		mockPathResolve.mockReturnValue(mockResolvedPath);
		mockFSReadFileSync.mockReturnValue(mockLegacyConfigFileContent);
		originalProcessArgv = process.argv;
		process.argv = ['node', '.bin/next', 'build'];
	});

	afterEach(() => {
		process.argv = originalProcessArgv;
	});

	describe('reading config file', () => {
		it('should read the file content specified by the `configPath` parameter', () => {
			withAmplify({}, mockConfigPath);

			expect(mockCWD).toHaveBeenCalled();
			expect(mockPathResolve).toHaveBeenCalledWith(
				mockCommandRoot,
				'',
				mockConfigPath
			);

			expect(mockFSReadFileSync).toHaveBeenCalledWith(mockResolvedPath, 'utf8');
		});

		it('should resolve the path with next command `dir` option', () => {
			const mockDirArg = 'subDir';
			const mockResolvedPathWithSubDir = `${mockCommandRoot}/${mockDirArg}/${mockConfigPath}`;
			mockPathResolve.mockReturnValueOnce(mockResolvedPathWithSubDir);
			process.argv = ['node', '.bin/next', 'build', mockDirArg];

			withAmplify({}, mockConfigPath);

			expect(mockPathResolve).toHaveBeenCalledWith(
				mockCommandRoot,
				mockDirArg,
				mockConfigPath
			);

			expect(mockFSReadFileSync).toHaveBeenCalledWith(
				mockResolvedPathWithSubDir,
				'utf8'
			);
		});

		it('should throw exception if no config found in the config file', () => {
			mockFSReadFileSync.mockReturnValueOnce('empty file');

			expect(() => withAmplify({}, mockConfigPath)).toThrow(AmplifyError);
		});

		it('should throw an AmplifyServerContextError if reading file content filed', () => {
			mockFSReadFileSync.mockImplementation(() => {
				throw new Error('File does not exist');
			});

			expect(() => withAmplify({}, mockConfigPath)).toThrow(AmplifyError);
		});
	});

	describe('return the config', () => {
		beforeEach(() => {
			mockParseAmplifyConfig.mockReset();
			mockParseAmplifyConfig.mockReturnValue(mockAmplifyConfig);
		});

		it('should invoke the parseAmplifyConfig function to transform the legacy config object', () => {
			mockParseAmplifyConfig.mockReturnValueOnce(mockAmplifyConfig);
			withAmplify({}, mockConfigPath);

			expect(mockParseAmplifyConfig).toHaveBeenCalledWith(legacyAmplifyConfig);
		});

		it('should add amplifyConfig to nextConfig.env', () => {
			const nextConfig = {};
			const result = withAmplify(nextConfig, mockConfigPath);

			expect(result).toEqual({
				env: {
					amplifyConfig: JSON.stringify(mockAmplifyConfig),
				},
				serverRuntimeConfig: {
					amplifyConfig: JSON.stringify(mockAmplifyConfig),
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
			const result = withAmplify(nextConfig, mockConfigPath);

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
});
