// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { createLocationCredentialsStore } from '../../../src/storageBrowser/locationCredentialsStore/create';
import {
	createStore,
	getValue,
	removeStore,
} from '../../../src/storageBrowser/locationCredentialsStore/registry';
import { LocationCredentialsStore } from '../../../src/storageBrowser/types';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../src/errors/types/validation';

jest.mock('../../../src/storageBrowser/locationCredentialsStore/registry');

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
				const { credentials } = await locationCredentialsProvider();
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

			it.each(['invalid-s3-uri', 's3://', 's3:///'])(
				'should throw if location credentials provider scope is not a valid S3 URI "%s"',
				async invalidScope => {
					expect.assertions(1);
					jest
						.mocked(getValue)
						.mockResolvedValue({ credentials: mockedCredentials });
					const locationCredentialsProvider = store.getProvider({
						scope: invalidScope,
						permission: 'READWRITE',
					});
					try {
						await locationCredentialsProvider();
					} catch (e: any) {
						expect(e.message).toEqual(
							validationErrorMap[StorageValidationErrorCode.InvalidS3Uri]
								.message,
						);
					}
				},
			);
		});

		describe('destroy()', () => {
			it('should call removeStore() from store', () => {
				const store = createLocationCredentialsStore({
					handler: jest.fn(),
				});
				store.destroy();
				expect(removeStore).toHaveBeenCalled();
			});
		});
	});
});
