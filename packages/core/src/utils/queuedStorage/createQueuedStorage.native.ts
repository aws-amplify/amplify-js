// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { QueuedStorage } from './types';

export const createQueuedStorage = (): QueuedStorage => {
	// TODO(HuiSF): implement for react-native
	return {
		async add(item, options) {
			throw new Error('method has not been implemented');
		},
		async peek(n) {
			throw new Error('method has not been implemented');
		},
		async peekAll() {
			throw new Error('method has not been implemented');
		},
		async delete(items) {
			throw new Error('method has not been implemented');
		},
		async clear() {
			throw new Error('method has not been implemented');
		},
		isFull(maxBytesSizeInMiB) {
			throw new Error('method has not been implemented');
		},
	};
};
