// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUser } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/identifyUser.native';
import { identifyUserInternal } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/identifyUserInternal';
import { IdentifyUserInput } from '../../../../../src/pushNotifications/providers/customer-profiles/types';

jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils/identifyUserInternal',
);

describe('identifyUser (customer-profiles, native)', () => {
	const mockIdentifyUserInternal = identifyUserInternal as jest.Mock;

	beforeEach(() => {
		mockIdentifyUserInternal.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockIdentifyUserInternal.mockReset();
	});

	it('performs a profile-only identify and registers NO device', async () => {
		const input: IdentifyUserInput = {
			userProfile: {
				email: 'email',
				name: 'name',
				customAttributes: { hobby: 'biking' },
			},
		};
		await identifyUser(input);

		expect(mockIdentifyUserInternal).toHaveBeenCalledTimes(1);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({
			userProfile: input.userProfile,
		});
		const call = mockIdentifyUserInternal.mock.calls[0][0];
		// native identify no longer registers a device or sends a userId
		expect(call).not.toHaveProperty('userId');
		expect(call).not.toHaveProperty('deviceToken');
		expect(call).not.toHaveProperty('channelType');
		expect(call).not.toHaveProperty('options');
	});

	it('forwards a minimal input (empty userProfile)', async () => {
		await identifyUser({ userProfile: {} });

		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({ userProfile: {} });
	});

	it('rejects if the identify request rejects', async () => {
		mockIdentifyUserInternal.mockRejectedValue(new Error('service error'));
		await expect(identifyUser({ userProfile: {} })).rejects.toThrow(
			'service error',
		);
	});
});
