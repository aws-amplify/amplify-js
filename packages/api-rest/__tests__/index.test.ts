// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { del, get, head, patch, post, put } from '../src/index';
import {
	del as commonDel,
	get as commonGet,
	head as commonHead,
	patch as commonPatch,
	post as commonPost,
	put as commonPut,
} from '../src/apis/common/publicApis';

jest.mock('../src/apis/common/publicApis');

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};

const AMPLIFY_CONTEXT_BRAND = Symbol.for('amplify.context');

const mockCtx: AmplifyContext = {
	resourcesConfig: {},
	libraryOptions: {},
	fetchAuthSession: jest.fn(),
	clearCredentials: jest.fn(),
	getTokens: jest.fn(),
};
Object.defineProperty(mockCtx, AMPLIFY_CONTEXT_BRAND, {
	value: true,
	enumerable: false,
});

describe('REST API handlers', () => {
	beforeAll(() => {
		setGlobalContext(mockCtx);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	it('get should call common get API with client-side Amplify singleton', async () => {
		get(input);
		expect(commonGet).toHaveBeenCalledWith(mockCtx, input);
	});

	it('post should call common post API with client-side Amplify singleton', async () => {
		post(input);
		expect(commonPost).toHaveBeenCalledWith(mockCtx, input);
	});

	it('put should call common put API with client-side Amplify singleton', async () => {
		put(input);
		expect(commonPut).toHaveBeenCalledWith(mockCtx, input);
	});

	it('del should call common del API with client-side Amplify singleton', async () => {
		del(input);
		expect(commonDel).toHaveBeenCalledWith(mockCtx, input);
	});

	it('patch should call common patch API with client-side Amplify singleton', async () => {
		patch(input);
		expect(commonPatch).toHaveBeenCalledWith(mockCtx, input);
	});

	it('head should call common head API with client-side Amplify singleton', async () => {
		head(input);
		expect(commonHead).toHaveBeenCalledWith(mockCtx, input);
	});
});
