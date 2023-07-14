// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum CognitoUserPoolKey {
	accessToken = 'accessToken',

	refreshToken = 'refreshToken',

	idToken = 'idToken',
}

export enum LegacyCognitoUserPoolKeys {
	accessToken = 'accessToken',

	refreshToken = 'refreshToken',

	idToken = 'idToken',

	lastAuthUser = 'LastAuthUser',

	clockDrift = 'clockDrift',

	userData = 'userData',
}

export enum CognitoDeviceKey {
	deviceKey = 'deviceKey',

	deviceGroupKey = 'deviceGroupKey',

	randomPasswordKey = 'randomPasswordKey',
}

/**
 * The key to get/set the auth token storage manager version.
 */
export const USER_POOL_MANAGER_VERSION_KEY = 'UserPoolManagerVersionKey';

/**
 * The key to get/set the device key storage manager version.
 */
export const DEVICE_KEY_MANAGER_VERSION_KEY = 'DeviceKeyManagerVersionKey';

/**
 * The token manager version.
 */
export enum AuthTokenStorageManagerVersion {
	/**
	 * No auth token store manager version is present.
	 *
	 * Either the token manager has never been initialized, or
	 * the tokens are stored in a legacy format.
	 * */
	none = 'none',
	/**
	 * The initial implementation of auth token manager version
	 */
	v1 = 'v1',
}
