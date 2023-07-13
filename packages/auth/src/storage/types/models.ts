// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type CognitoKeys<CognitoKey extends string> = {
	[Key in CognitoKey]: string;
};

export type CognitoUserPoolTokens = {
	idToken: string;
	refreshToken: string;
	accessToken: string;
};

export type LegacyCognitoUserPoolTokens = {
	lastAuthUser: string;
	clockDrift: string;
	userData: string;
	idToken: string;
	refreshToken: string;
	accessToken: string;
};

export interface AuthTokenManager {
	loadTokens(): Promise<Record<string, string> | null>;
	storeTokens(tokens: Record<string, string>): Promise<void>;
	clearTokens(): Promise<void>;
}

export type CognitoDeviceKeyTokens = {
	deviceKey: string;
	deviceGroupKey: string;
	randomPasswordKey: string;
};
