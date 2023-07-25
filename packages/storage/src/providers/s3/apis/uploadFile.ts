// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3UploadFileResult, S3UploadOptions } from '../types';
import { StorageUploadFileParameter, DownloadTask } from '../../../types';

// TODO
export declare const uploadFile: (
	params: StorageUploadFileParameter<S3UploadOptions>
) => DownloadTask<S3UploadFileResult>;
