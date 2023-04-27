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
import { isClockSkewError } from '../../../../src/clients/utils/isClockSkewError';
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

const mockisClockSkewError = isClockSkewError as jest.Mock;
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

	test('should adjust clock offset if server returns skew error', async () => {
		mockisClockSkewError.mockReturnValue(true);
		const serverTime = signingDate.toISOString();
		const nextHandler = jest.fn().mockRejectedValue({ ServerTime: serverTime });
		const signableHandler = getSignableHandler(nextHandler);
		const config = { ...defaultSigningOptions };

		try {
			await signableHandler(defaultRequest, config);
		} catch (error) {
			expect(mockGetUpdatedSystemClockOffset).toBeCalledWith(serverTime, 0);
			expect(config).toStrictEqual({
				...defaultSigningOptions,
				systemClockOffset: updatedOffset,
			});
		}
		expect.assertions(2);
	});

	test.each(['Date', 'date'])(
		'should adjust clock offset if server returns error with %s header',
		async key => {
			const serverTime = signingDate.toISOString();
			const nextHandler = jest.fn().mockRejectedValueOnce({
				$response: {
					headers: {
						[key]: serverTime,
					},
				},
			});
			const signableHandler = getSignableHandler(nextHandler);
			const config = { ...defaultSigningOptions };

			try {
				await signableHandler(defaultRequest, config);
			} catch (error) {
				expect(mockGetUpdatedSystemClockOffset).toBeCalledWith(serverTime, 0);
				expect(config).toStrictEqual({
					...defaultSigningOptions,
					systemClockOffset: updatedOffset,
				});
			}
			expect.assertions(2);
		}
	);
});
