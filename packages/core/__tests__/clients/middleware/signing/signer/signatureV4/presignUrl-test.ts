// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { presignUrl } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/presignUrl';
import { HttpRequest } from '../../../../../../src/clients/types';
import { signingTestTable } from './testUtils/signingTestTable';
import { getDefaultRequest, signingOptions } from './testUtils/data';

describe('presignUrl', () => {
	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedUrl }) => {
				const updatedRequest: HttpRequest = {
					...getDefaultRequest(),
					...request,
				};
				queryParams?.forEach(([key, value]) => {
					updatedRequest.url?.searchParams.append(key, value);
				});
				const updatedOptions = {
					...signingOptions,
					...options,
				};
				return [name, updatedRequest, updatedOptions, expectedUrl];
			}
		)
	)('presigns url with %s', async (_, request, options, expected) => {
		expect((await presignUrl(request, options)).toString()).toBe(expected);
	});
});
