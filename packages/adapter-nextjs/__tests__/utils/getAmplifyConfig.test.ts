// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyConfig } from '../../src/utils/getAmplifyConfig';

describe('getAmplifyConfig', () => {
	beforeEach(() => {
		delete process.env.amplifyConfig;
	});

	it('should return amplifyConfig from env vars', () => {
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
		process.env.amplifyConfig = JSON.stringify(mockAmplifyConfig);

		const result = getAmplifyConfig();
		expect(result).toEqual(mockAmplifyConfig);
	});

	it('should throw error when amplifyConfig is not found from env vars', () => {
		expect(() => getAmplifyConfig()).toThrowError();
	});
});
