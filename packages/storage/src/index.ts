// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: (ashwinkumar6) cleanup old exports
import { Storage, StorageInstance } from './Storage';
export { Storage as StorageClass, StorageInstance as Storage };
export {
	AWSS3Provider,
	uploadData,
	uploadFile,
	downloadData,
	downloadFile,
	remove,
	list,
	getProperties,
	copy,
	getUrl,
} from './providers';
export * from './types';
