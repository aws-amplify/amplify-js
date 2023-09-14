// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextConfig } from 'next';
import getConfig from 'next/config';
import { getAmplifyConfig } from '../../src/utils/getAmplifyConfig';
import { AmplifyError } from '@aws-amplify/core/internals/utils';

jest.mock('next/config');

const mockGetConfig = getConfig as jest.Mock;

describe('getAmplifyConfig', () => {
	const mockAmplifyConfig = {
		Auth: {
			identityPoolId: '123',
			userPoolId: 'abc',
			userPoolWebClientId: 'def',
		},
		Storage: {
			bucket: 'bucket',
			region: 'us-east-1',
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
		expect(() => getAmplifyConfig()).toThrow(AmplifyError);
	});
});
