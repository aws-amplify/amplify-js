// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUser } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/identifyUser';
import { identifyUserInternal } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/identifyUserInternal';
import { IdentifyUserInput } from '../../../../../src/pushNotifications/providers/customer-profiles/types';

jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils/identifyUserInternal',
);

describe('identifyUser (customer-profiles, web)', () => {
	const mockIdentifyUserInternal = identifyUserInternal as jest.Mock;

	beforeEach(() => {
		mockIdentifyUserInternal.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockIdentifyUserInternal.mockReset();
	});

	it('performs a profile-only identify with the userProfile and no userId', async () => {
		const input: IdentifyUserInput = {
			userProfile: {
				email: 'user@example.com',
				name: 'Jane Doe',
				phone: '555-555-5555',
				location: { city: 'Seattle', country: 'US' },
			},
		};
		await identifyUser(input);

		expect(mockIdentifyUserInternal).toHaveBeenCalledTimes(1);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({
			userProfile: input.userProfile,
		});
		const call = mockIdentifyUserInternal.mock.calls[0][0];
		expect(call).not.toHaveProperty('userId');
		expect(call).not.toHaveProperty('deviceToken');
		expect(call).not.toHaveProperty('channelType');
		expect(call).not.toHaveProperty('options');
	});

	it('forwards a minimal input (empty userProfile)', async () => {
		await identifyUser({ userProfile: {} });

		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({ userProfile: {} });
	});

	it('rejects when the underlying identify request rejects', async () => {
		mockIdentifyUserInternal.mockRejectedValue(new Error('service error'));
		await expect(identifyUser({ userProfile: {} })).rejects.toThrow(
			'service error',
		);
	});
});
