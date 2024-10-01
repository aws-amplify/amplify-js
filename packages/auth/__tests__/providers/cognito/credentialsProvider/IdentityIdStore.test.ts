// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Identity, ResourcesConfig } from '@aws-amplify/core';

import { DefaultIdentityIdStore } from '../../../../src/providers/cognito/credentialsProvider/IdentityIdStore';

const mockKeyValueStorage = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

const validAuthConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			identityPoolId: 'us-east-1:test-id',
			userPoolClientId: 'test-id',
			allowGuestAccess: true,
		},
	},
};
const validAuthKey = {
	identityId: `com.amplify.Cognito.${
		validAuthConfig.Auth!.Cognito!.identityPoolId
	}.identityId`,
};
const validGuestIdentityId: Identity = { type: 'guest', id: 'guest-id' };
const validPrimaryIdentityId: Identity = { type: 'primary', id: 'primary-id' };

const noIdentityPoolIdAuthConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			userPoolClientId: 'test-id',
		},
	},
};

describe('DefaultIdentityIdStore', () => {
	const defaultIdStore = new DefaultIdentityIdStore(mockKeyValueStorage);
	beforeAll(() => {
		defaultIdStore.setAuthConfig(validAuthConfig.Auth!);
	});

	afterEach(() => {
		mockKeyValueStorage.setItem.mockClear();
		mockKeyValueStorage.getItem.mockClear();
		mockKeyValueStorage.removeItem.mockClear();
		mockKeyValueStorage.clear.mockClear();
	});

	it('should set the Auth config required to form the storage keys', async () => {
		expect(defaultIdStore._authKeys).toEqual(validAuthKey);
	});

	it('should store guest identityId in keyValueStorage', async () => {
		defaultIdStore.storeIdentityId(validGuestIdentityId);
		expect(mockKeyValueStorage.setItem).toHaveBeenCalledWith(
			validAuthKey.identityId,
			validGuestIdentityId.id,
		);
		expect(defaultIdStore._primaryIdentityId).toBeUndefined();
		expect(defaultIdStore._hasGuestIdentityId).toBe(true);
	});

	it('should load guest identityId from keyValueStorage', async () => {
		mockKeyValueStorage.getItem.mockReturnValue(validGuestIdentityId.id);

		expect(await defaultIdStore.loadIdentityId()).toEqual(validGuestIdentityId);
	});

	it('should store primary identityId in keyValueStorage', async () => {
		defaultIdStore.storeIdentityId(validPrimaryIdentityId);
		expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
			validAuthKey.identityId,
		);
		expect(defaultIdStore._primaryIdentityId).toEqual(
			validPrimaryIdentityId.id,
		);
		expect(defaultIdStore._hasGuestIdentityId).toBe(false);
	});

	it('should load primary identityId from keyValueStorage', async () => {
		expect(await defaultIdStore.loadIdentityId()).toEqual(
			validPrimaryIdentityId,
		);
	});

	it('should clear the cached identityId', async () => {
		defaultIdStore.clearIdentityId();
		expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
			validAuthKey.identityId,
		);
		expect(defaultIdStore._primaryIdentityId).toBeUndefined();
	});

	it('should throw when identityPoolId is not present while setting the auth config', async () => {
		expect(() => {
			defaultIdStore.setAuthConfig(noIdentityPoolIdAuthConfig.Auth!);
		}).toThrow('Invalid identity pool id provided.');
	});

	it('should return null when the underlying keyValueStorage method returns null', async () => {
		mockKeyValueStorage.getItem.mockReturnValue(null);
		expect(await defaultIdStore.loadIdentityId()).toBeNull();
	});

	it('should return null when the underlying keyValueStorage method throws', async () => {
		mockKeyValueStorage.getItem.mockRejectedValue(new Error('Error'));
		expect(await defaultIdStore.loadIdentityId()).toBeNull();
	});

	it('should not call keyValueStorage.removeItem when there is no guest identityId to clear', async () => {
		const refreshIdentityIdStore = new DefaultIdentityIdStore(
			mockKeyValueStorage,
		);
		refreshIdentityIdStore.setAuthConfig(validAuthConfig.Auth!);

		refreshIdentityIdStore.storeIdentityId(validPrimaryIdentityId);
		expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalled();
	});
});
