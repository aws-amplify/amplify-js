// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DefaultIdentityIdStore } from '../../../src/providers/cognito';
import { Identity, ResourcesConfig } from '@aws-amplify/core';

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
	describe('Happy Path Cases:', () => {
		beforeAll(() => {
			defaultIdStore.setAuthConfig(validAuthConfig.Auth!);
		});
		it('Should set the Auth config required to form the storage keys', async () => {
			expect(defaultIdStore._authKeys).toEqual(validAuthKey);
		});
		it('Should store guest identityId in keyValueStorage', async () => {
			defaultIdStore.storeIdentityId(validGuestIdentityId);
			expect(mockKeyValueStorage.setItem).toHaveBeenCalledWith(
				validAuthKey.identityId,
				validGuestIdentityId.id,
			);
			expect(defaultIdStore._primaryIdentityId).toBeUndefined();
		});
		it('Should load guest identityId from keyValueStorage', async () => {
			mockKeyValueStorage.getItem.mockReturnValue(validGuestIdentityId.id);

			expect(await defaultIdStore.loadIdentityId()).toEqual(
				validGuestIdentityId,
			);
		});
		it('Should store primary identityId in keyValueStorage', async () => {
			defaultIdStore.storeIdentityId(validPrimaryIdentityId);
			expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
				validAuthKey.identityId,
			);
			expect(defaultIdStore._primaryIdentityId).toEqual(
				validPrimaryIdentityId.id,
			);
		});
		it('Should load primary identityId from keyValueStorage', async () => {
			expect(await defaultIdStore.loadIdentityId()).toEqual(
				validPrimaryIdentityId,
			);
		});
		it('Should clear the cached identityId', async () => {
			defaultIdStore.clearIdentityId();
			expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
				validAuthKey.identityId,
			);
			expect(defaultIdStore._primaryIdentityId).toBeUndefined();
		});
	});
	describe('Error Path Cases:', () => {
		it('Should assert when identityPoolId is not present while setting the auth config', async () => {
			try {
				defaultIdStore.setAuthConfig(noIdentityPoolIdAuthConfig.Auth!);
			} catch (e: any) {
				expect(e.name).toEqual('InvalidIdentityPoolIdException');
			}
		});
	});
});
