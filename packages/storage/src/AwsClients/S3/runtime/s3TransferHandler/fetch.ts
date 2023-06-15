// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	HttpResponse,
	authenticatedHandler,
} from '@aws-amplify/core/internals/aws-client-utils';
import type { s3TransferHandler as s3BrowserTransferhandler } from './xhr';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { contentSha256Middleware } from '../contentSha256middleware';

/**
 * S3 transfer handler for node based on Node-fetch. On top of basic transfer handler, it also supports
 * x-amz-content-sha256 header. However, it does not support request&response process tracking like browser.
 *
 * @internal
 */
export const s3TransferHandler: typeof s3BrowserTransferhandler =
	composeTransferHandler<[{}], HttpRequest, HttpResponse>(
		authenticatedHandler,
		[contentSha256Middleware]
	);
