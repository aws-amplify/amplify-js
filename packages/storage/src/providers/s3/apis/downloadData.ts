// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadDataRequest, DownloadTask } from '../../../types';
import { S3TransferOptions, S3DownloadDataResult } from '../types';

// TODO: pending implementation
export declare const downloadData: (
	params: StorageDownloadDataRequest<S3TransferOptions>
) => DownloadTask<S3DownloadDataResult>;
