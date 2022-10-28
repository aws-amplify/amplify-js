// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
let store = {};
export class CacheObject {
	static clear(): void {
		store = {};
	}

	static getItem(key: string): string | null {
		return store[key] || null;
	}

	static setItem(key: string, value: string): void {
		store[key] = value;
	}

	static removeItem(key: string): void {
		delete store[key];
	}
}
