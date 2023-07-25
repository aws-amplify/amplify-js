// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3UploadDataResult, S3UploadOptions } from '../types';
import { StorageUploadDataParameter, DownloadTask } from '../../../types';

// TODO
export declare const uploadData: (
	params: StorageUploadDataParameter<S3UploadOptions>
) => DownloadTask<S3UploadDataResult>;
