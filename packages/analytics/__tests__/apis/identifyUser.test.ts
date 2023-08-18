// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUser } from '../../src/apis';
import { identifyUser as pinpointIdentifyUser } from '../../src/providers/pinpoint';
import { IdentifyUserParameters } from '../../src/types';

jest.mock('../../src/providers/pinpoint');

describe('Analytics API: identifyUser', () => {
	// assert mocks
	const mockPinpointIdentifyUser = pinpointIdentifyUser as jest.Mock;

	beforeEach(() => {
		mockPinpointIdentifyUser.mockClear();
	});

	test('passes through parameter to default Pinpoint identifyUser API', async () => {
		const params: IdentifyUserParameters = {
			userId: 'user-id',
			userProfile: {
				attributes: {
					hobbies: ['biking', 'climbing'],
				},
			},
		};
		await identifyUser(params);
		expect(mockPinpointIdentifyUser).toBeCalledWith(params);
	});
});
