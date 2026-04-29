// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import { GetUrlInput, GetUrlWithPathInput } from '../../../../src';
import { getUrl } from '../../../../src/providers/s3/apis';
import { getUrl as internalGetUrlImpl } from '../../../../src/providers/s3/apis/internal/getUrl';

jest.mock('../../../../src/providers/s3/apis/internal/getUrl');

const mockInternalGetUrlImpl = jest.mocked(internalGetUrlImpl);

const mockCtx = createMockAmplifyContext();

describe('client-side getUrl', () => {
	beforeAll(() => {
		setGlobalContext(mockCtx);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalGetUrlImpl.mockReturnValue(mockInternalResult);
		const input: GetUrlInput = {
			key: 'source-key',
		};
		expect(getUrl(input)).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalGetUrlImpl.mockReturnValue(mockInternalResult);
		const input: GetUrlWithPathInput = {
			path: 'abc',
		};
		expect(getUrl(input)).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(mockCtx, input);
	});
});
