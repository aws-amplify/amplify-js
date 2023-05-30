// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signRequest } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/signRequest';
import { HttpRequest } from '../../../../../../src/clients/types';
import { signingTestTable } from './testUtils/signingTestTable';
import { getDefaultRequest, signingOptions } from './testUtils/data';
import { SignRequestOptions } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/types';

describe('signRequest', () => {
	test.each(
		signingTestTable.map(
			({ name, request, queryParams, options, expectedAuthorization }) => {
				const updatedRequest: HttpRequest = {
					...getDefaultRequest(),
					...request,
				};
				queryParams?.forEach(([key, value]) => {
					updatedRequest.url?.searchParams.append(key, value);
				});
				const updatedOptions: SignRequestOptions = {
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
