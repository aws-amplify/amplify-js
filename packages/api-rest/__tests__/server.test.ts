// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { del, get, head, patch, post, put } from '../src/server';
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

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};

describe('REST API server handlers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('AmplifyContext path', () => {
		it('get should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			get(ctx, input);
			expect(commonGet).toHaveBeenCalledWith(ctx, input);
		});

		it('post should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			post(ctx, input);
			expect(commonPost).toHaveBeenCalledWith(ctx, input);
		});

		it('put should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			put(ctx, input);
			expect(commonPut).toHaveBeenCalledWith(ctx, input);
		});

		it('del should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			del(ctx, input);
			expect(commonDel).toHaveBeenCalledWith(ctx, input);
		});

		it('patch should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			patch(ctx, input);
			expect(commonPatch).toHaveBeenCalledWith(ctx, input);
		});

		it('head should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			head(ctx, input);
			expect(commonHead).toHaveBeenCalledWith(ctx, input);
		});
	});
});
