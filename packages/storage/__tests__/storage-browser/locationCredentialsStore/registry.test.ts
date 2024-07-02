/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../src/errors/types/validation';
import {
	createStore,
	getValue,
} from '../../../src/storage-browser/locationCredentialsStore/registry';
import {
	StoreInstance,
	initStore,
} from '../../../src/storage-browser/locationCredentialsStore/store';

jest.mock('../../../src/storage-browser/locationCredentialsStore/store');

// @ts-expect-error partial mock store
const mockedStore = 'MOCKED_STORE' as StoreInstance;

afterEach(() => {
	jest.clearAllMocks();
});

beforeEach(() => {
	jest.mocked(initStore).mockReturnValue(mockedStore);
});

describe('createStore', () => {
	it('should create a store with given capacity, refresh Handler', () => {
		const refreshHandler = jest.fn();
		createStore(refreshHandler, 20);
		expect(initStore).toHaveBeenCalledWith(refreshHandler, 20);
	});

	it('should return a symbol to refer the store instance', () => {
		const storeReference = createStore(jest.fn(), 20);
		expect(Object.prototype.toString.call(storeReference)).toBe(
			'[object Symbol]',
		);
	});
});

describe('getValue', () => {
	it('should throw if a store instance cannot be found from registry', async () => {
		expect.assertions(1);
		await expect(
			getValue({
				storeReference: Symbol('invalid'),
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: false,
			}),
		).rejects.toThrow(
			validationErrorMap[
				StorageValidationErrorCode.LocationCredentialsStoreDestroyed
			].message,
		);
	});
	it.todo('should look up a cache value for given location and permission');
	it.todo(
		'should look up a cache value for given location and READWRITE permission',
	);
	it.todo('should invoke the refresh handler if look up returns null');
	it.todo(
		'should invoke refresh handler only once if multiple look up for same location returns null',
	);
	it.todo('should throw if refresh handler throws');
	it.todo(
		'should invoke the refresh handler if the refresh handler previously fails',
	);
});

describe('removeStore', () => {
	it.todo('should remove the store with given symbol');
	it.todo('should not throw if store with given symbol does not exist');
});
