// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Entry point for browser-specific S3 client utilities. It's used where DOMParser is available.
export {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
	CANCELED_ERROR_MESSAGE,
	CONTENT_SHA256_HEADER,
} from './constants';
export { s3TransferHandler } from './s3TransferHandler/xhr';
export { parser } from './xmlParser/dom';
export { toBase64 } from './base64/index.browser';
