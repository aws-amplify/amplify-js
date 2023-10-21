// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import {
	initializeInAppMessaging,
	syncMessages,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import {
	STORAGE_KEY_SUFFIX,
	resolveCredentials,
	resolveConfig,
	getInAppMessagingUserAgentString,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import { simpleInAppMessages } from '../../../../testUtils/data';
import {
	updateEndpoint,
	resolveEndpointId,
} from '@aws-amplify/core/internals/providers/pinpoint';
import { getInAppMessages } from '@aws-amplify/core/internals/aws-clients/pinpoint';
import { InAppMessagingError } from '../../../../../src/inAppMessaging/errors';

jest.mock('@aws-amplify/core/internals/aws-clients/pinpoint');
jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');

const mockDefaultStorage = defaultStorage as jest.Mocked<typeof defaultStorage>;
const mockResolveCredentials = resolveCredentials as jest.Mock;
const mockUpdateEndpoint = updateEndpoint as jest.Mock;
const mockResolveEndpointId = resolveEndpointId as jest.Mock;
const mockGetInAppMessages = getInAppMessages as jest.Mock;
const mockGetInAppMessagingUserAgentString =
	getInAppMessagingUserAgentString as jest.Mock;
const mockResolveConfig = resolveConfig as jest.Mock;
const credentials = {
	credentials: {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
	},
	identityId: 'identity-id',
};
const config = { appId: 'app-id', region: 'region' };
const userAgentValue = 'user-agent-value';
const mockedHappyMessages = {
	InAppMessagesResponse: {
		InAppMessageCampaigns: simpleInAppMessages,
	},
};
const mockedEmptyMessages = {
	InAppMessagesResponse: {
		InAppMessageCampaigns: [],
	},
};

describe('syncMessages', () => {
	beforeAll(() => {
		initializeInAppMessaging();
		mockGetInAppMessagingUserAgentString.mockReturnValue(userAgentValue);
		mockResolveConfig.mockReturnValue(config);
		mockResolveCredentials.mockResolvedValue(credentials);
		mockGetInAppMessages.mockResolvedValue(mockedHappyMessages);
	});

	beforeEach(() => {
		mockResolveEndpointId.mockResolvedValue('endpoint-id');
	});

	afterEach(() => {
		mockUpdateEndpoint.mockClear();
		mockDefaultStorage.setItem.mockClear();
		mockResolveEndpointId.mockReset();
	});

	it('Gets in-app messages and stores them', async () => {
		await syncMessages();

		expect(mockDefaultStorage.setItem).toBeCalledWith(
			expect.stringContaining(STORAGE_KEY_SUFFIX),
			JSON.stringify(simpleInAppMessages)
		);
	});

	it('Only tries to store messages if there are messages to store', async () => {
		mockGetInAppMessages.mockResolvedValueOnce(mockedEmptyMessages);
		await syncMessages();

		expect(mockDefaultStorage.setItem).not.toBeCalled();
	});

	it('Rejects if there is a validation error', async () => {
		mockResolveEndpointId.mockImplementation(() => {
			throw new Error();
		});
		await expect(syncMessages()).rejects.toStrictEqual(
			expect.any(InAppMessagingError)
		);

		expect(mockDefaultStorage.setItem).not.toBeCalled();
	});

	it('Rejects if there is a failure getting messages', async () => {
		mockGetInAppMessages.mockRejectedValueOnce(Error);
		await expect(syncMessages()).rejects.toStrictEqual(
			expect.any(InAppMessagingError)
		);

		expect(mockDefaultStorage.setItem).not.toBeCalled();
	});

	it('Rejects if there is a failure storing messages', async () => {
		mockDefaultStorage.setItem.mockRejectedValueOnce(Error);
		await expect(syncMessages()).rejects.toStrictEqual(
			expect.any(InAppMessagingError)
		);
	});
});
