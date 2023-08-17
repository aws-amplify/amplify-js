// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '../types';

class MemoryKeyValueStorageClass implements KeyValueStorageInterface {
	myStorage: Record<string, string> = {};

	async setItem(key: string, value: string): Promise<void> {
		this.myStorage[key] = value;
		return;
	}

	async getItem(key: string): Promise<string | null> {
		return this.myStorage[key];
	}

	async removeItem(key: string): Promise<void> {
		delete this.myStorage[key];
		return;
	}

	async clear(): Promise<void> {
		Object.keys(this.myStorage).forEach(key => {
			delete this.myStorage[key];
		});

		return;
	}
}

export const MemoryKeyValueStorage = new MemoryKeyValueStorageClass();
