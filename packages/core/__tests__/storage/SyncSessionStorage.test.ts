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

	const user1: Record<string, string> = {
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

	test('should accept a value and retrieve the same value without any issue', () => {
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

	test('will update key if setItem on the same key is called again', () => {
		const newUserName = 'joonchoi+test';
		sessionStorage.setItem(signInStateKeys.username, user1.username);
		sessionStorage.setItem(signInStateKeys.username, newUserName);

		expect(sessionStorage.getItem(signInStateKeys.username)).toEqual(
			newUserName,
		);
	});

	test('should set a value and retrieve it with the same key', () => {
		const newUserName = 'joonchoi+tobedeleted';
		sessionStorage.setItem(signInStateKeys.username, newUserName);
		expect(sessionStorage.getItem(signInStateKeys.username)).toEqual(
			newUserName,
		);
		sessionStorage.removeItem(signInStateKeys.username);
		expect(sessionStorage.getItem(signInStateKeys.username)).toBeNull();
	});

	test('should clear out storage', () => {
		sessionStorage.clear();
		expect(sessionStorage.getItem(signInStateKeys.username)).toBeNull();
		expect(sessionStorage.getItem(signInStateKeys.challengeName)).toBeNull();
		expect(sessionStorage.getItem(signInStateKeys.signInSession)).toBeNull();
		expect(sessionStorage.getItem(signInStateKeys.expiry)).toBeNull();
	});

	test('should not throw if trying to delete a non existing key', () => {
		const badKey = 'nonExistingKey';

		expect(() => {
			sessionStorage.removeItem(badKey);
		}).not.toThrow();
	});
});
