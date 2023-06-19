// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { parseXmlBody, parseXmlError } from './parsePayload';
export {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
	s3TransferHandler,
} from '../runtime';
export {
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
	serializeObjectSsecOptionsToHeaders,
} from './serializeHelpers';
