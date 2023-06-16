// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Entry point for ReactNative-specific S3 client utilities
export {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
} from './constants';
export { s3TransferHandler } from './s3TransferHandler/xhr';
export { parser } from './xmlParser/pureJs';
