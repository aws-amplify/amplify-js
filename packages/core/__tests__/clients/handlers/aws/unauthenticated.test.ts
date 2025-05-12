// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeTransferHandler } from '../../../../src/clients/internal/composeTransferHandler';
import { unauthenticatedHandler } from '../../../../src/clients/handlers/aws/unauthenticated';
import { fetchTransferHandler } from '../../../../src/clients/handlers/fetch';
import {
	amzSdkInvocationIdHeaderMiddlewareFactory,
	amzSdkRequestHeaderMiddlewareFactory,
	retryMiddlewareFactory,
} from '../../../../src/clients/middleware/retry';
import { userAgentMiddlewareFactory } from '../../../../src/clients/middleware/userAgent';

jest.mock('../../../../src/clients/internal/composeTransferHandler', () => ({
	composeTransferHandler: jest
		.fn()
		.mockReturnValue('composed_transfer_handler'),
}));

describe('unauthenticated handler', () => {
	it('should be configured correctly', () => {
		expect(unauthenticatedHandler).toEqual('composed_transfer_handler');
		expect(composeTransferHandler).toHaveBeenCalledTimes(1);
		expect(composeTransferHandler).toHaveBeenCalledWith(fetchTransferHandler, [
			userAgentMiddlewareFactory,
			amzSdkInvocationIdHeaderMiddlewareFactory,
			retryMiddlewareFactory,
			amzSdkRequestHeaderMiddlewareFactory,
		]);
	});
});
