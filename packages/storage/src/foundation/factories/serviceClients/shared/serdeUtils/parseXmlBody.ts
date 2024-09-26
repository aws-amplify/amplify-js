// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { parser } from '../../../../dI';

export const parseXmlBody = async (response: HttpResponse): Promise<any> => {
	if (!response.body) {
		// S3 can return 200 without a body indicating failure.
		throw new Error('S3 aborted request.');
	}
	const data = await response.body.text();
	if (data?.length > 0) {
		try {
			return parser.parse(data);
		} catch (error) {
			throw new Error(`Failed to parse XML response: ${error}`);
		}
	}

	return {};
};
