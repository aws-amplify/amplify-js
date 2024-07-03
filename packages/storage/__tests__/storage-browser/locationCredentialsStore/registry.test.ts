/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

describe('createStore', () => {
	it.todo('should create a store with given capacity, refresh Handler');
	it.todo('should return a symbol to refer the store instance');
});

describe('getValue', () => {
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
