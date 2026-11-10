// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { loadAsyncStorage } from '@aws-amplify/react-native';

import { createInMemoryStore } from '../src/storage/adapter/InMemoryStore.native';

jest.mock('@aws-amplify/react-native', () => ({
	loadAsyncStorage: jest.fn(),
}));

describe('createInMemoryStore (native)', () => {
	it('should use the storage from loadAsyncStorage so that every supported async-storage version is normalized', () => {
		const mockStorage = { multiGet: jest.fn() };
		(loadAsyncStorage as jest.Mock).mockReturnValue(mockStorage);

		expect(createInMemoryStore()).toBe(mockStorage);
	});
});
