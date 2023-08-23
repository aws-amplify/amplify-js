// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: (ashwinkumar6) cleanup old exports
import { Storage, StorageInstance } from './Storage';
export { AWSS3Provider } from './providers/AWSS3Provider';
export { Storage as StorageClass, StorageInstance as Storage };
export {
	uploadData,
	downloadData,
	remove,
	list,
	getProperties,
	copy,
	getUrl,
} from './providers/s3';
export * from './types';

export { isCancelError } from './AwsClients/S3/runtime';
