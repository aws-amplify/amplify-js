// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUser } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/identifyUser';
import { identifyUserInternal } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/identifyUserInternal';
import { IdentifyUserInput } from '../../../../../src/pushNotifications/providers/customer-profiles/types';
import { userId } from '../../../../testUtils/data';

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

	it('performs a device-less profile identify with NO device token or channel type', async () => {
		const input: IdentifyUserInput = {
			userId,
			userProfile: {
				email: 'user@example.com',
				customProperties: { phoneNumber: ['555-555-5555'] },
			},
			options: { userAttributes: { interests: ['food'] } },
		};
		await identifyUser(input);

		expect(mockIdentifyUserInternal).toHaveBeenCalledTimes(1);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({
			userId: input.userId,
			userProfile: input.userProfile,
			options: input.options,
		});
		// The web path must never supply a device token or channel type.
		const call = mockIdentifyUserInternal.mock.calls[0][0];
		expect(call).not.toHaveProperty('deviceToken');
		expect(call).not.toHaveProperty('channelType');
	});

	it('forwards a minimal input (no options / userProfile)', async () => {
		await identifyUser({ userId, userProfile: {} });

		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({
			userId,
			userProfile: {},
			options: undefined,
		});
	});

	it('rejects when the underlying identify request rejects', async () => {
		mockIdentifyUserInternal.mockRejectedValue(new Error('service error'));
		await expect(identifyUser({ userId, userProfile: {} })).rejects.toThrow(
			'service error',
		);
	});
});
