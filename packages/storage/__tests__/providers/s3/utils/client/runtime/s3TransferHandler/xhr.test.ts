// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	amzSdkInvocationIdHeaderMiddlewareFactory,
	amzSdkRequestHeaderMiddlewareFactory,
	retryMiddlewareFactory,
	signingMiddlewareFactory,
	userAgentMiddlewareFactory,
} from '@aws-amplify/core/internals/aws-client-utils';

import { contentSha256MiddlewareFactory } from '../../../../../../../src/providers/s3/utils/client/runtime/contentSha256middleware';
import { xhrTransferHandler } from '../../../../../../../src/providers/s3/utils/client/runtime/xhrTransferHandler';
import { s3TransferHandler } from '../../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/xhr';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers', () => ({
	composeTransferHandler: jest
		.fn()
		.mockReturnValue('composed_transfer_handler'),
}));
jest.mock(
	'../../../../../../../src/providers/s3/utils/client/runtime/xhrTransferHandler',
	() => ({
		xhrTransferHandler: jest.fn().mockReturnValue('s3_transfer_handler'),
	}),
);

describe('s3 transfer handler', () => {
	it('should be configured correctly', () => {
		expect(s3TransferHandler).toEqual('composed_transfer_handler');
		expect(composeTransferHandler).toHaveBeenCalledTimes(1);
		expect(composeTransferHandler).toHaveBeenCalledWith(xhrTransferHandler, [
			contentSha256MiddlewareFactory,
			userAgentMiddlewareFactory,
			amzSdkInvocationIdHeaderMiddlewareFactory,
			retryMiddlewareFactory,
			amzSdkRequestHeaderMiddlewareFactory,
			signingMiddlewareFactory,
		]);
	});
});
