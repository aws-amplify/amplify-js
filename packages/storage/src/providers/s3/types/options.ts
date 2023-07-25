// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TransferProgressEvent } from '../../../types';
import { StorageOptions } from '../../../types/params';

interface S3Options extends StorageOptions {
	// Whether to head object to make sure the object existence before downloading; Default false
	validateObjectExistence?: boolean;
	// Whether to use accelerate endpoint. Default false
	useAccelerateEndpoint?: boolean;
}

/**
 * Parameter options interface for S3 downloadData, downloadFile, uploadData, uploadFile APIs
 */
export interface S3TransferOptions extends S3Options {
	// Callback function tracking
	onProgress?: (event: TransferProgressEvent) => void;
}

export interface S3GetUrlOptions extends S3Options {
	// Number of seconds till the URL expires. Default 900;
	expiration?: number;
}

export interface S3UploadOptions extends S3TransferOptions {
	contentDisposition?: string;
	contentEncoding?: string;
	contentType?: string;
	metadata?: Record<string, string>;
	tagging?: string;
}
