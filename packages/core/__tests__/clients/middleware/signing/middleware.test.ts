// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeTransferHandler } from '../../../../src/clients/internal/composeTransferHandler';
import {
	signingMiddlewareFactory,
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

jest.mock(
	'../../../../src/clients/middleware/signing/utils/getSkewCorrectedDate',
);
jest.mock(
	'../../../../src/clients/middleware/signing/utils/getUpdatedSystemClockOffset',
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
			[signingMiddlewareFactory],
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
		expect(nextHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: basicTestCase.expectedAuthorization,
				}),
			}),
			expect.objectContaining(defaultSigningOptions),
		);
	});

	test('can be configured with clock offset', async () => {
		const systemClockOffset = 100;
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const signableHandler = getSignableHandler(nextHandler);
		const config = { ...defaultSigningOptions, systemClockOffset };
		await signableHandler(defaultRequest, config);
		expect(nextHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: basicTestCase.expectedAuthorization,
				}),
			}),
			expect.objectContaining({
				...defaultSigningOptions,
				systemClockOffset,
			}),
		);
	});

	test('can be configured with credentials provider function', async () => {
		const credentialsProvider = jest.fn().mockResolvedValue(credentials);
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const signableHandler = getSignableHandler(nextHandler);
		const config = {
			...defaultSigningOptions,
			credentials: credentialsProvider,
		};
		await signableHandler(defaultRequest, config);
		expect(nextHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: basicTestCase.expectedAuthorization,
				}),
			}),
			expect.anything(),
		);
		expect(credentialsProvider).toHaveBeenCalledTimes(1);
	});

	test.each([
		['response with Date header', 'Date'],
		['response with date header', 'date'],
		['response with x-amz-date header', 'x-amz-date'],
	])('should adjust clock offset if server returns %s', async (_, key) => {
		const serverTime = signingDate.toISOString();
		const parsedServerTime = Date.parse(serverTime);
		const nextHandler = jest.fn().mockResolvedValue({
			headers: {
				[key!]: serverTime,
			},
		});

		const middlewareFunction = signingMiddlewareFactory(defaultSigningOptions)(
			nextHandler,
		);

		await middlewareFunction(defaultRequest);
		expect(mockGetUpdatedSystemClockOffset).toHaveBeenCalledWith(
			parsedServerTime,
			0,
		);

		jest.clearAllMocks();
		await middlewareFunction(defaultRequest);
		expect(mockGetSkewCorrectedDate).toHaveBeenCalledWith(updatedOffset);
		expect(mockGetUpdatedSystemClockOffset).toHaveBeenCalledWith(
			parsedServerTime,
			updatedOffset,
		);
		expect.assertions(3);
	});
});
