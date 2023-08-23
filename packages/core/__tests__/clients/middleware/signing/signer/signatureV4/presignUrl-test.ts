// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { presignUrl } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/presignUrl';
import { HttpRequest } from '../../../../../../src/clients/types';
import { signingTestTable } from './testUtils/signingTestTable';
import {
	formattedDates,
	getDefaultRequest,
	signingOptions,
} from './testUtils/data';
import { PresignUrlOptions } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/types';
import { getSignature } from '../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSignature';

jest.mock(
	'../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSignature',
	() => ({
		getSignature: jest
			.fn()
			.mockImplementation(
				jest.requireActual(
					'../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSignature'
				).getSignature
			),
	})
);

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
				const updatedOptions: PresignUrlOptions = {
					...signingOptions,
					...options,
				};
				return [name, updatedRequest, updatedOptions, expectedUrl];
			}
		)
	)('presigns url with %s', (_, request, options, expected) => {
		expect(presignUrl(request, options).toString()).toBe(expected);
	});

	test('should call getSignature with correct parameters', () => {
		const request = getDefaultRequest();
		const options = {
			...signingOptions,
			uriEscapePath: false,
		};
		presignUrl(request, options);
		expect(getSignature).toHaveBeenCalledWith(expect.anything(), {
			uriEscapePath: false,
			accessKeyId: options.credentials.accessKeyId,
			credentialScope: `${formattedDates.shortDate}/${options.signingRegion}/${options.signingService}/aws4_request`,
			longDate: formattedDates.longDate,
			secretAccessKey: options.credentials.secretAccessKey,
			shortDate: formattedDates.shortDate,
			sessionToken: undefined,
			signingRegion: options.signingRegion,
			signingService: options.signingService,
		});
	});
});
