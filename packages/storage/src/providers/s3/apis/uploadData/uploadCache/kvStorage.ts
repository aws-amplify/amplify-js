// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	MemoryKeyValueStorage,
	LocalStorage,
	KeyValueStorageInterface,
} from '@aws-amplify/core';

let resolvedStorage: KeyValueStorageInterface | undefined;

export const getKvStorage = async () => {
	if (resolvedStorage) {
		return resolvedStorage;
	}

	try {
		await LocalStorage.setItem('aws.amplify.test-ls', '1');
		await LocalStorage.removeItem('aws.amplify.test-ls');
		resolvedStorage = LocalStorage;
		return resolvedStorage;
	} catch (e) {
		resolvedStorage = MemoryKeyValueStorage;
		return MemoryKeyValueStorage;
	}
};
