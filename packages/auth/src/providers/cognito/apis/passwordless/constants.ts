// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const KEY_PASSWORDLESS_SIGN_IN_METHOD =
	'Amplify.Passwordless.signInMethod';
export const KEY_PASSWORDLESS_ACTION = 'Amplify.Passwordless.action';
export const KEY_PASSWORDLESS_DELIVERY_MEDIUM =
	'Amplify.Passwordless.deliveryMedium';
export const KEY_PASSWORDLESS_REDIRECT_URI = 'Amplify.Passwordless.redirectUri';

// Only for initiating the passwordless Auth flow. Cognito requires a value for challenge answer, but we don't
// evaluate it.
export const DUMMY_COGNITO_CHALLENGE_ANSWER = '<N/A>';
