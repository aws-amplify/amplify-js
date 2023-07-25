// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadDataParameter } from '../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';

// TODO
export declare const getUrl: (
	params: StorageDownloadDataParameter<S3GetUrlOptions>
) => Promise<S3GetUrlResult>;
