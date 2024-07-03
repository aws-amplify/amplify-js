/* eslint-disable unused-imports/no-unused-vars */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { createLocationCredentialsStore } from '../../../src/storage-browser/locationCredentialsStore/create';
import {
	createStore,
	getValue,
} from '../../../src/storage-browser/locationCredentialsStore/registry';
import { LocationCredentialsStore } from '../../../src/storage-browser/types';

jest.mock('../../../src/storage-browser/locationCredentialsStore/registry');

const mockedCredentials = 'MOCK_CREDS' as any as AWSCredentials;

describe('createLocationCredentialsStore', () => {
	it('should create a store', () => {
		const refreshHandler = jest.fn();
		const store = createLocationCredentialsStore({ handler: refreshHandler });

		expect(createStore).toHaveBeenCalledWith(refreshHandler);
		expect(store.getProvider).toBeDefined();
		expect(store.destroy).toBeDefined();
	});

	describe('created store', () => {
		describe('getProvider()', () => {
			let store: LocationCredentialsStore;

			beforeEach(() => {
				store = createLocationCredentialsStore({ handler: jest.fn() });
			});

			afterEach(() => {
				jest.clearAllMocks();
				store.destroy();
			});

			it('should call getValue() from store', async () => {
				expect.assertions(2);
				jest
					.mocked(getValue)
					.mockResolvedValue({ credentials: mockedCredentials });

				const locationCredentialsProvider = store.getProvider({
					scope: 's3://bucket/path/*',
					permission: 'READ',
				});
				const { credentials } = await locationCredentialsProvider({
					locations: [{ bucket: 'bucket', path: 'path/to/object' }],
					permission: 'READ',
				});
				expect(credentials).toEqual(mockedCredentials);
				expect(getValue).toHaveBeenCalledWith(
					expect.objectContaining({
						location: {
							scope: 's3://bucket/path/*',
							permission: 'READ',
						},
						forceRefresh: false,
					}),
				);
			});

			it('should validate credentials location with resolved common scope', async () => {
				expect.assertions(1);
				jest
					.mocked(getValue)
					.mockResolvedValue({ credentials: mockedCredentials });
				const locationCredentialsProvider = store.getProvider({
					scope: 's3://bucket/path/*',
					permission: 'READ',
				});
				const { credentials } = await locationCredentialsProvider({
					locations: [
						{ bucket: 'bucket', path: 'path/to/object' },
						{ bucket: 'bucket', path: 'path/to/object2' },
						{ bucket: 'bucket', path: 'path/folder' },
					],
					permission: 'READ',
				});
				expect(getValue).toHaveBeenCalledWith(
					expect.objectContaining({
						location: {
							scope: 's3://bucket/path/*',
							permission: 'READ',
						},
						forceRefresh: false,
					}),
				);
			});
		});
		describe('destroy()', () => {
			it.todo('should call removeStore() from store');
		});
	});
});
