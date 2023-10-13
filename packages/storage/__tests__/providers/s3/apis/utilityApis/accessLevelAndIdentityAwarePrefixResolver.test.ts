// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { accessLevelAndIdentityAwarePrefixResolver } from '../../../../../src/providers/s3/apis/utilityApis/accessLevelAndIdentityAwarePrefixResolver';

jest.mock('@aws-amplify/core', () => ({
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));

const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;

describe('accessLevelAndIdentityAwarePrefixResolver', () => {
	const mockIdentityId = 'mockIdentityId';

	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			identityId: mockIdentityId,
		});
	});

	it('returns private prefix when accessLevel is private', async () => {
		const prefix = await accessLevelAndIdentityAwarePrefixResolver({
			accessLevel: 'private',
		});
		expect(prefix).toEqual(`private/${mockIdentityId}/`);
	});

	it('returns protected prefix when accessLevel is protected', async () => {
		const mockTargetIdentityId = 'targetIdentityId';
		const prefix = await accessLevelAndIdentityAwarePrefixResolver({
			accessLevel: 'protected',
			targetIdentityId: mockTargetIdentityId,
		});
		expect(prefix).toEqual(`protected/${mockTargetIdentityId}/`);
	});

	it('returns public prefix when accessLevel is guest', async () => {
		const prefix = await accessLevelAndIdentityAwarePrefixResolver({
			accessLevel: 'guest',
		});
		expect(prefix).toEqual('public/');
	});
});
