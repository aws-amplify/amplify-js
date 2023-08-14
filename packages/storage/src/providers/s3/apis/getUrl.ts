// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadDataRequest } from '../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';

// TODO: pending implementation
export declare const getUrl: (
	params: StorageDownloadDataRequest<S3GetUrlOptions>
) => Promise<S3GetUrlResult>;
