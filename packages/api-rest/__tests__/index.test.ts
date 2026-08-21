// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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

import { createMockAmplifyContext } from './testUtils/mockAmplifyContext';

jest.mock('../src/apis/common/publicApis');

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};

const mockCtx = createMockAmplifyContext();

describe('REST API handlers', () => {
	beforeAll(() => {
		setGlobalContext(mockCtx);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('get should call common get API with resolved global context', () => {
		get(input);
		expect(commonGet).toHaveBeenCalledWith(mockCtx, input);
	});

	it('get should call common get API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		get(explicitCtx, input);
		expect(commonGet).toHaveBeenCalledWith(explicitCtx, input);
	});

	it('post should call common post API with resolved global context', () => {
		post(input);
		expect(commonPost).toHaveBeenCalledWith(mockCtx, input);
	});

	it('post should call common post API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		post(explicitCtx, input);
		expect(commonPost).toHaveBeenCalledWith(explicitCtx, input);
	});

	it('put should call common put API with resolved global context', () => {
		put(input);
		expect(commonPut).toHaveBeenCalledWith(mockCtx, input);
	});

	it('put should call common put API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		put(explicitCtx, input);
		expect(commonPut).toHaveBeenCalledWith(explicitCtx, input);
	});

	it('del should call common del API with resolved global context', () => {
		del(input);
		expect(commonDel).toHaveBeenCalledWith(mockCtx, input);
	});

	it('del should call common del API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		del(explicitCtx, input);
		expect(commonDel).toHaveBeenCalledWith(explicitCtx, input);
	});

	it('patch should call common patch API with resolved global context', () => {
		patch(input);
		expect(commonPatch).toHaveBeenCalledWith(mockCtx, input);
	});

	it('patch should call common patch API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		patch(explicitCtx, input);
		expect(commonPatch).toHaveBeenCalledWith(explicitCtx, input);
	});

	it('head should call common head API with resolved global context', () => {
		head(input);
		expect(commonHead).toHaveBeenCalledWith(mockCtx, input);
	});

	it('head should call common head API with explicit context', () => {
		const explicitCtx = createMockAmplifyContext();
		head(explicitCtx, input);
		expect(commonHead).toHaveBeenCalledWith(explicitCtx, input);
	});
});
