// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationParameter,
	StorageDownloadFileParameter,
	StorageUrl,
} from '../../../types';
import { S3DownloadDataOptions } from '../types';

// TODO
export declare const downloadFile: (
	params: StorageOperationParameter<S3DownloadDataOptions>
) => Promise<StorageUrl>;
