// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	signInWithRedirect,
	store,
} from '../../../src/providers/cognito/apis/signInWithRedirect';

import * as signInWithRedirectModule from '../../../src/providers/cognito/apis/signInWithRedirect';
Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
			loginWith: {
				oauth: {
					domain: 'mydomain.com',
					redirectSignIn: ['localHost:3000'],
					redirectSignOut: ['localHost:3000'],
					responseType: 'code',
					scopes: ['aws.cognito.signin.user.admin'],
				},
			},
		},
	},
});

describe('signInWithRedirect API', () => {
	let oauthSignInSpy;
	let clearOAuthDataSpy;
	beforeEach(() => {
		oauthSignInSpy = jest
			.spyOn(signInWithRedirectModule, 'oauthSignIn')
			.mockImplementationOnce(async () => {
				return {};
			});
		clearOAuthDataSpy = jest
			.spyOn(store, 'clearOAuthData')
			.mockImplementationOnce(async () => {
				return {};
			});
	});
	afterEach(() => {
		oauthSignInSpy.mockClear();
		clearOAuthDataSpy.mockClear();
	});
	it('should pass correct arguments to oauth', () => {
		// TODO ADD tests
	});

	it('should try to clear oauth data before starting an oauth flow.', async () => {
		await signInWithRedirect();
		expect(clearOAuthDataSpy).toHaveBeenCalled();
	});
});
