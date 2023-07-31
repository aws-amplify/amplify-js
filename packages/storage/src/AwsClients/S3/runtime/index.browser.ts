// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Entry point for browser-specific S3 client utilities. It's used where DOMParser is available.
export { CANCELED_ERROR_MESSAGE, CONTENT_SHA256_HEADER } from './constants';
export { s3TransferHandler } from './s3TransferHandler/xhr';
export { parser } from './xmlParser/dom';
export { isCancelError } from './xhrTransferHandler';
export { toBase64, utf8Encode } from './base64/index.browser';
