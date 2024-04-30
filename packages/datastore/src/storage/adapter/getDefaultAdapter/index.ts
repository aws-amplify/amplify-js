// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { isBrowser, isWebWorker } from '@aws-amplify/core/internals/utils';

import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
// eslint-disable-next-line import/no-named-as-default
import AsyncStorageAdapter from '../AsyncStorageAdapter';

const getDefaultAdapter: () => Adapter = () => {
	if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
		return IndexedDBAdapter as Adapter;
	}

	return AsyncStorageAdapter as Adapter;
};

export default getDefaultAdapter;
