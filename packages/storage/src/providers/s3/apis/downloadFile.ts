// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationParameter,
	StorageDownloadFileParameter,
	DownloadTask,
} from '../../../types';
import { S3DownloadDataOptions, S3DownloadFileResult } from '../types';

// TODO
export declare const downloadFile: (
	params: StorageOperationParameter<S3DownloadDataOptions> &
		StorageDownloadFileParameter
) => DownloadTask<S3DownloadFileResult>;
