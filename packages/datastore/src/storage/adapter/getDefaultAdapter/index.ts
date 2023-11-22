// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Adapter } from '..';
import IndexedDBAdapter from '~/src/storage/adapter/IndexedDBAdapter';
import AsyncStorageAdapter from '~/src/storage/adapter/AsyncStorageAdapter';
import { isBrowser, isWebWorker } from '@aws-amplify/core/internals/utils';

const getDefaultAdapter: () => Adapter = () => {
	if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
		return IndexedDBAdapter as Adapter;
	}

	return AsyncStorageAdapter as Adapter;
};

export default getDefaultAdapter;
