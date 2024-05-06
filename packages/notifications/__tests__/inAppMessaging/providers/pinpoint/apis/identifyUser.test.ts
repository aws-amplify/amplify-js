// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	identifyUser,
	initializeInAppMessaging,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import {
	resolveCredentials,
	resolveConfig,
	getInAppMessagingUserAgentString,
	CATEGORY,
	CHANNEL_TYPE,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';

import { IdentifyUserInput } from '../../../../../src/inAppMessaging/providers/pinpoint/types';

jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');

describe('InAppMessaging Pinpoint Provider API: identifyUser', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};
	const config = { appId: 'app-id', region: 'region' };
	const userAgentValue = 'user-agent-value';
	// assert mocks
	const mockUpdateEndpoint = updateEndpoint as jest.Mock;
	const mockgetInAppMessagingUserAgentString =
		getInAppMessagingUserAgentString as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;

	beforeAll(() => {
		initializeInAppMessaging();
		mockgetInAppMessagingUserAgentString.mockReturnValue(userAgentValue);
		mockResolveConfig.mockReturnValue(config);
		mockResolveCredentials.mockResolvedValue(credentials);
	});

	beforeEach(() => {
		mockUpdateEndpoint.mockReset();
	});

	it('passes through parameters to core Pinpoint updateEndpoint API', async () => {
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
			...config,
			channelType: CHANNEL_TYPE,
			category: CATEGORY,
			userAgentValue,
		});
	});

	it('passes through options along with input and other params to core Pinpoint updateEndpoint API', async () => {
		const userAttributes = { hobbies: ['biking', 'climbing'] };
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};
		const options: IdentifyUserInput['options'] = {
			address: 'test-address',
			optOut: 'NONE',
			userAttributes,
		};
		await identifyUser({ ...input, options });
		expect(mockUpdateEndpoint).toHaveBeenCalledWith({
			...input,
			...options,
			...credentials,
			...config,
			channelType: CHANNEL_TYPE,
			category: CATEGORY,
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
});
