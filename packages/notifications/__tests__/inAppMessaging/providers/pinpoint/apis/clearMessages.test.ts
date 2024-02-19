// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import {
	clearMessages,
	initializeInAppMessaging,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import {
	STORAGE_KEY_SUFFIX,
	PINPOINT_KEY_PREFIX,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import { InAppMessagingError } from '../../../../../src/inAppMessaging/errors';

jest.mock('@aws-amplify/core/internals/aws-clients/pinpoint');
jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');

const mockDefaultStorage = defaultStorage as jest.Mocked<typeof defaultStorage>;

describe('clearMessages', () => {
	afterEach(() => {
		mockDefaultStorage.removeItem.mockClear();
	});
	it('Rejects if there is a validation error', async () => {
		await expect(clearMessages()).rejects.toStrictEqual(
			expect.any(InAppMessagingError),
		);
		expect(mockDefaultStorage.removeItem).not.toHaveBeenCalled();
	});

	it('Rejects if there is a failure storing messages', async () => {
		initializeInAppMessaging();
		mockDefaultStorage.removeItem.mockRejectedValueOnce(
			new InAppMessagingError({
				name: 'ItemCorrupted',
				message: 'Item corrupted',
			}),
		);
		await expect(clearMessages()).rejects.toStrictEqual(
			expect.any(InAppMessagingError),
		);
	});

	it('Succeeds in calling the removeItem API of defaultStorage with the correct key', async () => {
		initializeInAppMessaging();
		await clearMessages();
		expect(mockDefaultStorage.removeItem).toHaveBeenCalledWith(
			`${PINPOINT_KEY_PREFIX}${STORAGE_KEY_SUFFIX}`,
		);
	});
});
