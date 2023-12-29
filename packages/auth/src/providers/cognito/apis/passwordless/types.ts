// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributes } from '../../../../types';

/**
 * Payload sent to the backend when signing a user in.
 */
export type PasswordlesSignUpPayload = {
	username: string;
} & (
	| {
			method: 'MAGIC_LINK';
			deliveryMedium: 'EMAIL';
			userAttributes: Required<AuthUserAttributes<'email'>>;
	  }
	| {
			method: 'OTP';
			deliveryMedium: 'EMAIL';
			userAttributes: Required<AuthUserAttributes<'email'>>;
	  }
	| {
			method: 'OTP';
			deliveryMedium: 'SMS';
			userAttributes: Required<AuthUserAttributes<'phone_number'>>;
	  }
);

export type PreInitiateAuthPayload = {
	/**
	 * Optional fields to indicate where the code/link should be delivered.
	 */
	email?: string;
	phoneNumber?: string;
	username: string;
	/**
	 * The user pool ID
	 */
	userPoolId: string;
};
