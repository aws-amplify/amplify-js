// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorage } from './KeyValueStorage';
import { getDefaultStorageWithFallback } from './utils';

/**
 * @internal
 */
export class DefaultStorage extends KeyValueStorage {
	constructor() {
		super(getDefaultStorageWithFallback());
	}
}
