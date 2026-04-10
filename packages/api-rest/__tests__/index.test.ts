// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { del, get, head, patch, post, put } from '../src/index';
import {
	del as commonDel,
	get as commonGet,
	head as commonHead,
	patch as commonPatch,
	post as commonPost,
	put as commonPut,
} from '../src/apis/common/publicApis';

import { createMockAmplifyContext } from './testUtils/mockAmplifyContext';

jest.mock('../src/apis/common/publicApis');

const mockCtx = createMockAmplifyContext();

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};

describe('REST API handlers', () => {
	it('get should call common get API with ctx', async () => {
		get(mockCtx, input);
		expect(commonGet).toHaveBeenCalledWith(mockCtx, input);
	});

	it('post should call common post API with ctx', async () => {
		post(mockCtx, input);
		expect(commonPost).toHaveBeenCalledWith(mockCtx, input);
	});

	it('put should call common put API with ctx', async () => {
		put(mockCtx, input);
		expect(commonPut).toHaveBeenCalledWith(mockCtx, input);
	});

	it('del should call common del API with ctx', async () => {
		del(mockCtx, input);
		expect(commonDel).toHaveBeenCalledWith(mockCtx, input);
	});

	it('patch should call common patch API with ctx', async () => {
		patch(mockCtx, input);
		expect(commonPatch).toHaveBeenCalledWith(mockCtx, input);
	});

	it('head should call common head API with ctx', async () => {
		head(mockCtx, input);
		expect(commonHead).toHaveBeenCalledWith(mockCtx, input);
	});
});
