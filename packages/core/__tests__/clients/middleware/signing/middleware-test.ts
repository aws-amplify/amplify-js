// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeTransferHandler } from '../../../../src/clients/internal/composeTransferHandler';
import {
	signingMiddleware,
	SigningOptions,
} from '../../../../src/clients/middleware/signing';
import { getSkewCorrectedDate } from '../../../../src/clients/middleware/signing/utils/getSkewCorrectedDate';
import { getUpdatedSystemClockOffset } from '../../../../src/clients/middleware/signing/utils/getUpdatedSystemClockOffset';
import {
	HttpRequest,
	HttpResponse,
	MiddlewareHandler,
} from '../../../../src/clients/types';
import {
	credentials,
	signingDate,
	signingRegion,
	signingService,
	url,
} from './signer/signatureV4/testUtils/data';
import { signingTestTable } from './signer/signatureV4/testUtils/signingTestTable';

jest.mock('../../../../src/clients/utils/isClockSkewError');
jest.mock(
	'../../../../src/clients/middleware/signing/utils/getSkewCorrectedDate'
);
jest.mock(
	'../../../../src/clients/middleware/signing/utils/getUpdatedSystemClockOffset'
);

const mockGetSkewCorrectedDate = getSkewCorrectedDate as jest.Mock;
const mockGetUpdatedSystemClockOffset =
	getUpdatedSystemClockOffset as jest.Mock;

describe('Signing middleware', () => {
	const defaultSigningOptions = {
		credentials,
		region: signingRegion,
		service: signingService,
	};
	const defaultRequest = { method: 'GET', headers: {}, url: new URL(url) };
	const defaultResponse: HttpResponse = {
		body: 'foo' as any,
		statusCode: 200,
		headers: {},
	};
	const updatedOffset = 10000;
	const [basicTestCase] = signingTestTable;
	const getSignableHandler = (nextHandler: MiddlewareHandler<any, any>) =>
		composeTransferHandler<[SigningOptions], HttpRequest, HttpResponse>(
			nextHandler,
			[signingMiddleware]
		);
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetSkewCorrectedDate.mockReturnValue(signingDate);
		mockGetUpdatedSystemClockOffset.mockReturnValue(updatedOffset);
	});

	test('should sign request', async () => {
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const signableHandler = getSignableHandler(nextHandler);
		const config = { ...defaultSigningOptions };
		await signableHandler(defaultRequest, config);
		expect(nextHandler).toBeCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: basicTestCase.expectedAuthorization,
				}),
			}),
			expect.objectContaining(defaultSigningOptions)
		);
	});

	test('can be configured with clock offset', async () => {
		const systemClockOffset = 100;
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const signableHandler = getSignableHandler(nextHandler);
		const config = { ...defaultSigningOptions, systemClockOffset };
		await signableHandler(defaultRequest, config);
		expect(nextHandler).toBeCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: basicTestCase.expectedAuthorization,
				}),
			}),
			expect.objectContaining({
				...defaultSigningOptions,
				systemClockOffset,
			})
		);
	});

	test.each([
		['skew error', null],
		['error with Date header', 'Date'],
		['error with date header', 'date'],
	])('should adjust clock offset if server returns %s', async (_, key) => {
		mockisClockSkewError.mockReturnValue(true);
		const serverTime = signingDate.toISOString();
		const parsedServerTime = Date.parse(serverTime);
		const nextHandler = key
			? jest.fn().mockRejectedValue({
					$response: {
						headers: {
							[key]: serverTime,
						},
					},
			  })
			: jest.fn().mockRejectedValue({ ServerTime: serverTime });

		const middlewareFunction = signingMiddleware(defaultSigningOptions)(
			nextHandler
		);

		try {
			await middlewareFunction(defaultRequest);
		} catch (error) {
			expect(mockGetSkewCorrectedDate).toBeCalledWith(0);
			expect(mockGetUpdatedSystemClockOffset).toBeCalledWith(
				parsedServerTime,
				0
			);
			jest.clearAllMocks();
			try {
				await middlewareFunction(defaultRequest);
			} catch (error) {
				expect(mockGetSkewCorrectedDate).toBeCalledWith(updatedOffset);
				expect(mockGetUpdatedSystemClockOffset).toBeCalledWith(
					parsedServerTime,
					updatedOffset
				);
			}
		}
		expect.assertions(4);
	});
});
