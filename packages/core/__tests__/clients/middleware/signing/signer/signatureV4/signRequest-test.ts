// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signRequest } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/signRequest';
import { signingTestTable } from './testUtils/signingTestTable';
import { getDefaultRequest, signingOptions } from './testUtils/data';

describe('signRequest', () => {
	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedAuthorization }) => {
				const updatedRequest = {
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
				return [name, updatedRequest, updatedOptions, expectedAuthorization];
			}
		)
	)('signs request with %s', (_, request, options, expected) => {
		expect(signRequest(request, options).headers.authorization).toBe(expected);
	});
});
