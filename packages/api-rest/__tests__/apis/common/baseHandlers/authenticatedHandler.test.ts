// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	fetchTransferHandler,
	retryMiddlewareFactory,
	signingMiddlewareFactory,
	userAgentMiddlewareFactory,
} from '@aws-amplify/core/internals/aws-client-utils';

import { authenticatedHandler } from '../../../../src/apis/common/baseHandlers/authenticatedHandler';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers', () => ({
	composeTransferHandler: jest
		.fn()
		.mockReturnValue('composed_transfer_handler'),
}));

describe('authenticated handler', () => {
	it('should be configured correctly', () => {
		expect(authenticatedHandler).toEqual('composed_transfer_handler');
		expect(composeTransferHandler).toHaveBeenCalledTimes(1);
		expect(composeTransferHandler).toHaveBeenCalledWith(fetchTransferHandler, [
			userAgentMiddlewareFactory,
			retryMiddlewareFactory,
			signingMiddlewareFactory,
		]);
	});
});
