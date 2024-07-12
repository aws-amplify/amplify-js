// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { createLocationCredentialsStore } from '../../../src/storageBrowser/locationCredentialsStore/create';
import {
	createStore,
	getValue,
	removeStore,
} from '../../../src/storageBrowser/locationCredentialsStore/registry';
import { validateCredentialsProviderLocation } from '../../../src/storageBrowser/locationCredentialsStore/validators';
import { LocationCredentialsStore } from '../../../src/storageBrowser/types';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../src/errors/types/validation';

jest.mock('../../../src/storageBrowser/locationCredentialsStore/registry');
jest.mock('../../../src/storageBrowser/locationCredentialsStore/validators');

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
					permission: 'READWRITE',
				});
				await locationCredentialsProvider({
					locations: [
						{ bucket: 'bucket', path: 'path/to/object' },
						{ bucket: 'bucket', path: 'path/to/object2' },
						{ bucket: 'bucket', path: 'path/folder' },
					],
					permission: 'READ',
				});
				expect(validateCredentialsProviderLocation).toHaveBeenCalledWith(
					{ bucket: 'bucket', path: 'path/', permission: 'READ' },
					{ bucket: 'bucket', path: 'path/*', permission: 'READWRITE' },
				);
			});

			it('should throw if action requires cross-bucket permission', async () => {
				expect.assertions(1);
				jest
					.mocked(getValue)
					.mockResolvedValue({ credentials: mockedCredentials });
				const locationCredentialsProvider = store.getProvider({
					scope: 's3://bucket/path/*',
					permission: 'READWRITE',
				});
				try {
					await locationCredentialsProvider({
						locations: [
							{ bucket: 'bucket-1', path: 'path/to/object' },
							{ bucket: 'bucket-2', path: 'path/to/object2' },
						],
						permission: 'READ',
					});
				} catch (e: any) {
					expect(e.message).toEqual(
						validationErrorMap[
							StorageValidationErrorCode.LocationCredentialsCrossBucket
						].message,
					);
				}
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
						await locationCredentialsProvider({
							locations: [{ bucket: 'XXXXXXXX', path: 'path/to/object' }],
							permission: 'READ',
						});
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
