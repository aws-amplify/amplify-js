// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
// TODO[AllanZhengYP]: support isCancelError in Node.js with node-fetch
export { isCancelError } from './errors/CanceledError';
