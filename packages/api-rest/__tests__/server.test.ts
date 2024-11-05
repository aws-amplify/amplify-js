// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { del, get, head, patch, post, put } from '../src/server';
import {
	del as commonDel,
	get as commonGet,
	head as commonHead,
	patch as commonPatch,
	post as commonPost,
	put as commonPut,
} from '../src/apis/common/publicApis';

jest.mock('../src/apis/common/publicApis');
jest.mock('@aws-amplify/core/internals/adapter-core');

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};
const contextSpec = { token: { value: 'token' } } as any;
const mockGetAmplifyServerContext = getAmplifyServerContext as jest.Mock;

describe('REST API handlers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: 'mockedAmplifyServerSideContext',
		});
	});

	it('get should call common get API with server-side Amplify context', async () => {
		get(contextSpec, input);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(commonGet).toHaveBeenCalledWith(
			'mockedAmplifyServerSideContext',
			input,
		);
	});

	it('post should call common post API with server-side Amplify context', async () => {
		post(contextSpec, input);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(commonPost).toHaveBeenCalledWith(
			'mockedAmplifyServerSideContext',
			input,
		);
	});

	it('put should call common put API with server-side Amplify context', async () => {
		put(contextSpec, input);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(commonPut).toHaveBeenCalledWith(
			'mockedAmplifyServerSideContext',
			input,
		);
	});

	it('del should call common del API with server-side Amplify context', async () => {
		del(contextSpec, input);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(commonDel).toHaveBeenCalledWith(
			'mockedAmplifyServerSideContext',
			input,
		);
	});

	it('patch should call common patch API with server-side Amplify context', async () => {
		patch(contextSpec, input);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(commonPatch).toHaveBeenCalledWith(
			'mockedAmplifyServerSideContext',
			input,
		);
	});

	it('head should call common head API with server-side Amplify context', async () => {
		head(contextSpec, input);
		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(commonHead).toHaveBeenCalledWith(
			'mockedAmplifyServerSideContext',
			input,
		);
	});
});
