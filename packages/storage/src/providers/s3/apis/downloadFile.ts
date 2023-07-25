// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadFileParameter, DownloadTask } from '../../../types';
import { S3TransferOptions, S3DownloadFileResult } from '../types';

// TODO
export declare const downloadFile: (
	params: StorageDownloadFileParameter<S3TransferOptions>
) => DownloadTask<S3DownloadFileResult>;
