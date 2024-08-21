// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { SyncSessionStorage } from '../../src/storage/SyncSessionStorage';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

describe('SyncSessionStorage', () => {
	let sessionStorage: SyncSessionStorage;
	const signInStateKeys: Record<string, string> = {
		username: 'CognitoSignInState.username',
		challengeName: 'CognitoSignInState.challengeName',
		signInSession: 'CognitoSignInState.signInSession',
		expiry: 'CognitoSignInState.expiry',
	};

	const user1 = {
		username: 'joonchoi',
		challengeName: 'CUSTOM_CHALLENGE',
		signInSession: '888577-ltfgo-42d8-891d-666l858766g7',
		expiry: '1234567',
	};

	beforeEach(() => {
		sessionStorage = new SyncSessionStorage();
	});

	afterEach(() => {
		sessionStorage.clear();
	});

	it('can set and retrieve item by key', () => {
		sessionStorage.setItem(signInStateKeys.username, user1.username);
		sessionStorage.setItem(signInStateKeys.challengeName, user1.challengeName);
		sessionStorage.setItem(signInStateKeys.signInSession, user1.signInSession);
		sessionStorage.setItem(signInStateKeys.expiry, user1.expiry);

		expect(sessionStorage.getItem(signInStateKeys.username)).toEqual(
			user1.username,
		);
		expect(sessionStorage.getItem(signInStateKeys.challengeName)).toEqual(
			user1.challengeName,
		);
		expect(sessionStorage.getItem(signInStateKeys.signInSession)).toEqual(
			user1.signInSession,
		);
		expect(sessionStorage.getItem(signInStateKeys.expiry)).toEqual(
			user1.expiry,
		);
	});

	it('can override item by setting with the same key', () => {
		const newUserName = 'joonchoi+test';
		sessionStorage.setItem(signInStateKeys.username, user1.username);
		sessionStorage.setItem(signInStateKeys.username, newUserName);

		expect(sessionStorage.getItem(signInStateKeys.username)).toEqual(
			newUserName,
		);
	});

	it('can remove item by key', () => {
		const newUserName = 'joonchoi+tobedeleted';
		sessionStorage.setItem(signInStateKeys.username, newUserName);
		expect(sessionStorage.getItem(signInStateKeys.username)).toEqual(
			newUserName,
		);
		sessionStorage.removeItem(signInStateKeys.username);
		expect(sessionStorage.getItem(signInStateKeys.username)).toBeNull();
	});

	it('clears all items', () => {
		sessionStorage.clear();
		expect(sessionStorage.getItem(signInStateKeys.username)).toBeNull();
		expect(sessionStorage.getItem(signInStateKeys.challengeName)).toBeNull();
		expect(sessionStorage.getItem(signInStateKeys.signInSession)).toBeNull();
		expect(sessionStorage.getItem(signInStateKeys.expiry)).toBeNull();
	});

	it('will not throw if trying to delete a non existing key', () => {
		const badKey = 'nonExistingKey';

		expect(() => {
			sessionStorage.removeItem(badKey);
		}).not.toThrow();
	});
});
