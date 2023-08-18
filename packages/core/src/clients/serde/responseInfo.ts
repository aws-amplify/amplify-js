// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResponseMetadata, MetadataBearer } from '@aws-sdk/types';
import { HttpResponse } from '../types/http';

export const parseMetadata = (response: HttpResponse): ResponseMetadata => {
	const { headers, statusCode } = response;
	return {
		...(isMetadataBearer(response) ? response.$metadata : {}),
		httpStatusCode: statusCode,
		requestId:
			headers['x-amzn-requestid'] ??
			headers['x-amzn-request-id'] ??
			headers['x-amz-request-id'],
		extendedRequestId: headers['x-amz-id-2'],
		cfId: headers['x-amz-cf-id'],
	};
};

type IsResponse = { $metadata: any };
const isMetadataBearer = (response: unknown): response is MetadataBearer =>
	typeof (response as IsResponse)?.$metadata === 'object';
