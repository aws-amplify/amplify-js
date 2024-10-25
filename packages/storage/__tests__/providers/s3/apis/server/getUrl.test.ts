// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { GetUrlInput, GetUrlWithPathInput } from '../../../../../src';
import { getUrl } from '../../../../../src/providers/s3/apis/server';
import { getUrl as internalGetUrlImpl } from '../../../../../src/providers/s3/apis/internal/getUrl';

jest.mock('../../../../../src/providers/s3/apis/internal/getUrl');
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockInternalGetUrlImpl = jest.mocked(internalGetUrlImpl);
const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockInternalResult = 'RESULT' as any;
const mockAmplifyClass = 'AMPLIFY_CLASS' as any;

describe('server-side getUrl', () => {
	beforeEach(() => {
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplifyClass,
		});
		mockInternalGetUrlImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const input: GetUrlInput = {
			key: 'source-key',
		};
		expect(
			getUrl(
				{
					token: { value: Symbol('123') },
				},
				input,
			),
		).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: GetUrlWithPathInput = {
			path: 'abc',
		};
		expect(
			getUrl(
				{
					token: { value: Symbol('123') },
				},
				input,
			),
		).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(mockAmplifyClass, input);
	});
});
