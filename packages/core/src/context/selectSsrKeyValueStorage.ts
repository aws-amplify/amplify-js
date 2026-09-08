// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CookieStorage, defaultStorage } from '../storage';
import { KeyValueStorageInterface } from '../types';

/**
 * Selects the key-value storage backing the default auth providers based on
 * the `ssr` library option:
 *
 * - `ssr: true` → a **fresh** cookie-based storage (`sameSite: 'lax'`), so
 *   tokens survive server-side rendering round-trips. Callers that also need
 *   a cookie-backed identity-id store (e.g. the `aws-amplify` umbrella's
 *   default Cognito credentials provider) should reuse the returned instance
 *   for it.
 * - otherwise → the shared {@link defaultStorage} (`localStorage`-backed)
 *   singleton.
 *
 * Extracted from the `aws-amplify` umbrella's library-options resolution so
 * the SSR storage choice lives in a single place.
 *
 * @param ssr - The `LibraryOptions.ssr` flag.
 * @returns The key-value storage to back token/credentials providers with.
 *
 * @internal
 */
export function selectSsrKeyValueStorage(
	ssr?: boolean,
): KeyValueStorageInterface {
	return ssr ? new CookieStorage({ sameSite: 'lax' }) : defaultStorage;
}
