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
