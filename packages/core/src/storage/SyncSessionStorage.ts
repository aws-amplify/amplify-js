// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SyncKeyValueStorage } from './SyncKeyValueStorage';
import { getSessionStorageWithFallback } from './utils';

/**
 * @internal
 */
export class SyncSessionStorage extends SyncKeyValueStorage {
	constructor() {
		super(getSessionStorageWithFallback());
	}
}
