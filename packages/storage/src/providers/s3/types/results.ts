// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadDataResult } from '../../../types';

type S3ObjectInformation = {
	lastModified?: Date;
	contentLength?: number;
	eTag?: string;
	metadata?: Record<string, string>;
};

export type S3DownloadDataResult = StorageDownloadDataResult &
	S3ObjectInformation;

export type S3DownloadFileResult = S3ObjectInformation;
