// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getEndpointId,
	updateEndpoint,
} from '@aws-amplify/core/internals/providers/pinpoint';
import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';
import { identifyUser } from '../../../../../src/pushNotifications/providers/pinpoint/apis/identifyUser.native';
import { IdentifyUserInput } from '../../../../../src/pushNotifications/providers/pinpoint/types';
import {
	getPushNotificationUserAgentString,
	resolveCredentials,
} from '../../../../../src/pushNotifications/utils';
import {
	getChannelType,
	getInflightDeviceRegistration,
	resolveConfig,
} from '../../../../../src/pushNotifications/providers/pinpoint/utils';
import {
	channelType,
	credentials,
	pinpointConfig,
	userAgentValue,
} from '../../../../testUtils/data';

jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');
jest.mock('../../../../../src/pushNotifications/providers/pinpoint/utils');
jest.mock('../../../../../src/pushNotifications/utils');

describe('identifyUser (native)', () => {
	// assert mocks
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;
	const mockGetChannelType = getChannelType as jest.Mock;
	const mockGetEndpointId = getEndpointId as jest.Mock;
	const mockGetInflightDeviceRegistration =
		getInflightDeviceRegistration as jest.Mock;
	const mockGetPushNotificationUserAgentString =
		getPushNotificationUserAgentString as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;

	beforeAll(() => {
		mockGetChannelType.mockReturnValue(channelType);
		mockGetPushNotificationUserAgentString.mockReturnValue(userAgentValue);
		mockResolveConfig.mockReturnValue(pinpointConfig);
		mockResolveCredentials.mockResolvedValue(credentials);
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetEndpointId.mockReset();
		mockUpdateEndpoint.mockReset();
		mockGetInflightDeviceRegistration.mockClear();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toThrow();
	});

	it('passes through parameter along with Push Notifications boilerplate to core Pinpoint identifyUser API', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {
				customProperties: {
					hobbies: ['biking', 'climbing'],
				},
				email: 'email',
				name: 'name',
				plan: 'plan',
			},
		};
		await identifyUser(input);
		expect(mockUpdateEndpoint).toHaveBeenCalledWith({
			...input,
			...credentials,
			...pinpointConfig,
			category: 'PushNotification',
			channelType,
			userAgentValue,
		});
	});

	it('passes through service options along with Push Notifications boilerplate to core Pinpoint identifyUser API', async () => {
		const userAttributes = { hobbies: ['biking', 'climbing'] };
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};
		const options: IdentifyUserInput['options'] = {
			userAttributes,
		};
		await identifyUser({ ...input, options });
		expect(mockUpdateEndpoint).toHaveBeenCalledWith({
			...input,
			...credentials,
			...pinpointConfig,
			category: 'PushNotification',
			channelType,
			userAgentValue,
			userAttributes,
		});
	});

	it('rejects if underlying promise rejects', async () => {
		mockUpdateEndpoint.mockRejectedValue(new Error());
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};
		await expect(identifyUser(input)).rejects.toBeDefined();
	});

	it('awaits device registration promise when endpoint is not present', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};
		mockGetEndpointId.mockResolvedValue(undefined);
		await identifyUser(input);
		expect(mockGetInflightDeviceRegistration).toHaveBeenCalled();
	});

	it('does not await device registration promise when endpoint is present', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};
		mockGetEndpointId.mockResolvedValue('endpoint-id');
		await identifyUser(input);
		expect(mockGetInflightDeviceRegistration).not.toHaveBeenCalled();
	});
});
