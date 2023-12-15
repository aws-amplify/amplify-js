// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPasswordlessDeliveryDestination, ClientMetadata } from "../../types/models";

/**
 * Payload sent to the backend when creating a user.
 */
export type PasswordlessSignUpPayload = {
	destination: AuthPasswordlessDeliveryDestination;
	email?: string;
	phone_number?: string;
	username: string;
}

/**
 * Payload sent to the backend when signing a user in.
 */
export type PasswordlessSignInPayload = ({
	signInMethod: 'MAGIC_LINK';
	destination: Extract<AuthPasswordlessDeliveryDestination, "EMAIL">;
} | {
	signInMethod: 'OTP';
	destination: AuthPasswordlessDeliveryDestination;
}) & {
	username: string;
	clientMetadata?: ClientMetadata;
}

export type PreInitiateAuthPayload = {
	/**
	 * Optional fields to indicate where the code/link should be delivered.
	 */
	email?: string;
	phone_number?: string;
	username: string;

	/**
	 * Any optional user attributes that were provided during sign up.
	 */
	userAttributes?: { [name: string]: string | undefined };

	/**
	 * The delivery medium for passwordless sign in. For magic link this will
	 * always be "EMAIL". For OTP, it will be the value provided by the customer.
	 */
	deliveryMedium: string;

	/**
	 * The user pool ID
	 */
	userPoolId: string;

	/**
	 * The user pool region
	 */
	region: string;
};
