// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Entry point for Node.js-specific S3 client utilities
// This behavior is not guaranteed in v5.
export { CANCELED_ERROR_MESSAGE, CONTENT_SHA256_HEADER } from './constants';
export { s3TransferHandler } from './s3TransferHandler/fetch';
export { parser } from './xmlParser/pureJs';
export { isCancelError } from './xhrTransferHandler';
export { toBase64, utf8Encode } from './index.native';
