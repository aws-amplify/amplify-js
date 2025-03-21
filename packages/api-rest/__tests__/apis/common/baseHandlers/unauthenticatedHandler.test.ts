// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	fetchTransferHandler,
	retryMiddlewareFactory,
	userAgentMiddlewareFactory,
} from '@aws-amplify/core/internals/aws-client-utils';

import { unauthenticatedHandler } from '../../../../src/apis/common/baseHandlers/unauthenticatedHandler';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers', () => ({
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
			retryMiddlewareFactory,
		]);
	});
});
