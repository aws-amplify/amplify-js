// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
import AsyncStorageAdapter from '../AsyncStorageAdapter';
import { browserOrNode, isWebWorker } from '@aws-amplify/core/internals/utils';
const getDefaultAdapter: () => Adapter = () => {
	const { isBrowser } = browserOrNode();

	if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
		return IndexedDBAdapter as Adapter;
	}

	return AsyncStorageAdapter as Adapter;
};

export default getDefaultAdapter;
