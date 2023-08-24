// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';
import { KeyValueStorage } from './KeyValueStorage';

/**
 * @internal
 */
export class CookieStorage extends KeyValueStorage {
	constructor() {
		super(new InMemoryStorage());
	}
}
