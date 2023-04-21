// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { presignUrl } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/presignUrl';
import { HttpRequest } from '../../../../../../src/clients/types';
import { signingTestTable } from './testUtils/signingTestTable';
import { getDefaultRequest, signingOptions } from './testUtils/data';

describe('presignUrl', () => {
	test.each(
		signingTestTable.map(({ name, request, queryParams, expectedUrl }) => {
			const updatedRequest: HttpRequest = {
				...getDefaultRequest(),
				...request,
			};
			queryParams?.forEach(([key, value]) => {
				updatedRequest.url?.searchParams.append(key, value);
			});
			return [name, updatedRequest, expectedUrl];
		})
	)('presigns url with %s', async (_, request, expected) => {
		expect((await presignUrl(request, signingOptions)).toString()).toBe(
			expected
		);
	});
});
