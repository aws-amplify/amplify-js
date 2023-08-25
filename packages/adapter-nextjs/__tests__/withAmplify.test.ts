// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '@aws-amplify/core';
import { withAmplify } from '../src/withAmplify';

const mockAmplifyConfig: ResourcesConfig = {
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

describe('withAmplify', () => {
	it('should add amplifyConfig to nextConfig.env', () => {
		const nextConfig = {};
		const result = withAmplify(nextConfig, mockAmplifyConfig);

		expect(result).toEqual({
			env: {
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
		});
	});

	it('should merge amplifyConfig to nextConfig.env (if this key has already defined)', () => {
		const nextConfig = {
			env: {
				existingKey: '123',
			},
		};
		const result = withAmplify(nextConfig, mockAmplifyConfig);

		expect(result).toEqual({
			env: {
				existingKey: '123',
				amplifyConfig: JSON.stringify(mockAmplifyConfig),
			},
		});
	});
});
