// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GetUrlInput, GetUrlWithPathInput } from '../../../../../src';
import { getUrl } from '../../../../../src/providers/s3/apis/server';
import { getUrl as internalGetUrlImpl } from '../../../../../src/providers/s3/apis/internal/getUrl';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock('../../../../../src/providers/s3/apis/internal/getUrl');

const mockInternalGetUrlImpl = jest.mocked(internalGetUrlImpl);
const mockInternalResult = 'RESULT' as any;

// Phase C4: the server entry is a bare re-export of the ctx-native main API.
// The caller supplies a branded `AmplifyContext` directly (no server-context
// registry / `getAmplifyServerContext`), which flows straight to the internal
// implementation.
describe('server-side getUrl', () => {
	beforeEach(() => {
		mockInternalGetUrlImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: GetUrlInput = {
			key: 'source-key',
		};
		expect(getUrl(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: GetUrlWithPathInput = {
			path: 'abc',
		};
		expect(getUrl(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(ctx, input);
	});
});
