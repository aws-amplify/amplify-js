// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDefaultStreamName } from '../../../../src/providers/cloudwatch/utils';
import { fetchAuthSession } from '@aws-amplify/core';

const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const testDeviceId = 'test-device-id-1';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	getDeviceId: jest.fn(() => testDeviceId),
}));

describe('CloudWatch Utils: ', () => {
	describe('getDefaultStreamName', () => {
		it('should return a log stream name for a guest', async () => {
			mockFetchAuthSession.mockImplementationOnce(() => {
				return { userSub: undefined };
			});
			expect(await getDefaultStreamName()).toContain(`${testDeviceId}.guest`);
		});
		it('should return a log stream name for a logged in user', async () => {
			const loggedInUserSub = 'test-logged-in-user-sub';
			mockFetchAuthSession.mockImplementationOnce(() => {
				return { userSub: loggedInUserSub };
			});
			expect(await getDefaultStreamName()).toContain(
				`${testDeviceId}.${loggedInUserSub}`
			);
		});
	});
});
