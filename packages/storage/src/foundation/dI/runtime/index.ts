// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): remove duplicate storage/src/providers/s3/utils/client/runtime/index.ts
// Entry point for Node.js-specific S3 client utilities
// This behavior is not guaranteed in v5.
export {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
	CANCELED_ERROR_MESSAGE,
	CONTENT_SHA256_HEADER,
} from './constants';
export { s3TransferHandler } from './s3TransferHandler/fetch';
export { parser } from './xmlParser/xmlParser';
export { toBase64 } from './index.native';
