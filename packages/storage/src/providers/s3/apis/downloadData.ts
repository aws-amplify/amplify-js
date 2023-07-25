// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageOperationParameter, DownloadTask } from '../../../types';
import { S3TransferOptions, S3DownloadDataResult } from '../types';

// TODO
export declare const downloadData: (
	params: StorageOperationParameter<S3TransferOptions>
) => DownloadTask<S3DownloadDataResult>;
