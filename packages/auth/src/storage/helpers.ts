// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { AuthTokenManager, CognitoKeys } from './types';
import { AuthTokenStorageManagerVersion } from './keys';

export function getCognitoKeys<T extends Record<string, string>>(
	cognitoKeys: T
) {
	const keys = Object.values({ ...cognitoKeys });

	return (prefix: string, identifier: string) =>
		keys.reduce(
			(acc, cognitoKey) => ({
				...acc,
				[cognitoKey]: `${prefix}.${identifier}.${cognitoKey}`,
			}),
			{} as CognitoKeys<keyof T & string>
		);
}

export async function getUsernameFromStorage(
	storage: AuthStorage,
	legacyKey: string
): Promise<string | null> {
	return storage.getItem(legacyKey);
}

export async function migrateTokens<
	TokenManager extends AuthTokenManager,
	LegacyTokenManager extends AuthTokenManager
>(
	legacyManager: LegacyTokenManager,
	tokenManager: TokenManager,
	versionManagerKey: string
): Promise<void> {
	const storage = tokenManager.storage;
	const tokenManagerVersion =
		(await storage.getItem(versionManagerKey)) ??
		AuthTokenStorageManagerVersion.none;

	if (tokenManagerVersion !== AuthTokenStorageManagerVersion.none) return;

	try {
		const legacyTokens = await legacyManager.loadTokens();
		if (legacyTokens !== null) {
			await tokenManager.storeTokens(legacyTokens);
		}
	} catch (error) {
		// TODO: log error
	} finally {
		try {
			await legacyManager.clearTokens();
		} catch (error) {
			// TODO: log error
		}
	}
	// set the token manager version after
	await storage.setItem(versionManagerKey, AuthTokenStorageManagerVersion.v1);
}
