// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { parseXmlBody, parseXmlError } from './parsePayload';
export {
	s3TransferHandler,
	CANCELED_ERROR_MESSAGE,
	isCancelError,
	CONTENT_SHA256_HEADER,
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
	serializePathnameObjectKey,
	serializeObjectSsecOptionsToHeaders,
} from './serializeHelpers';
export { toBase64, utf8Encode } from '../runtime';

// TODO: remove this after functional refactor
export const SEND_DOWNLOAD_PROGRESS_EVENT = 'sendUploadProgress';
export const SEND_UPLOAD_PROGRESS_EVENT = 'sendDownloadProgress';
