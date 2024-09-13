// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { parseXmlBody, parseXmlError } from './parsePayload';
export { s3TransferHandler } from './runtime';
export {
	buildStorageServiceError,
	deserializeBoolean,
	deserializeMetadata,
	deserializeNumber,
	deserializeTimestamp,
	emptyArrayGuard,
	map,
} from './deserializeHelpers';
export {
	assignStringVariables,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './serializeHelpers';
export { retryDecider } from './retryDecider';
