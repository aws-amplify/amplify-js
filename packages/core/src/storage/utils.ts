// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';

/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */
export const getDefaultStorageWithFallback = (): Storage =>
	window?.localStorage ? window.localStorage : new InMemoryStorage();

/**
 * @internal
 * @returns Either a reference to window.sessionStorage or an in-memory storage as fallback
 */
export const getSessionStorageWithFallback = (): Storage =>
	window?.sessionStorage ? window.sessionStorage : new InMemoryStorage();
