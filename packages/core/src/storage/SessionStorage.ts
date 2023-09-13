// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorage } from './KeyValueStorage';
import { getSessionStorageWithFallback } from './utils';

/**
 * @internal
 */
export class SessionStorage extends KeyValueStorage {
	constructor() {
		super(getSessionStorageWithFallback());
	}
}
