// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): remove duplicate storage/src/providers/s3/utils/client/utils/parsePayload.ts
import {
	ErrorParser,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';

import { parseXmlBody } from './parseXmlBody';

export const parseXmlError: ErrorParser = async (response?: HttpResponse) => {
	if (!response || response.statusCode < 300) {
		return;
	}
	const { statusCode } = response;
	const body = await parseXmlBody(response);
	const code = body?.Code
		? (body.Code as string)
		: statusCode === 404
			? 'NotFound'
			: statusCode.toString();
	const message = body?.message ?? body?.Message ?? code;
	const error = new Error(message);

	return Object.assign(error, {
		name: code,
		$metadata: parseMetadata(response),
	});
};
