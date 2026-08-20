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

import { createMockAmplifyContext } from './testUtils/mockAmplifyContext';

jest.mock('../src/apis/common/publicApis');
jest.mock('@aws-amplify/core/internals/adapter-core');

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};
const contextSpec = { token: { value: 'token' } } as any;
const mockGetAmplifyServerContext = getAmplifyServerContext as jest.Mock;

describe('REST API server handlers', () => {
	const mockAmplify = {
		getConfig: jest.fn().mockReturnValue({ API: { REST: {} } }),
		libraryOptions: {},
		Auth: {
			fetchAuthSession: jest.fn().mockResolvedValue({}),
			clearCredentials: jest.fn().mockResolvedValue(undefined),
			getTokens: jest.fn().mockResolvedValue(undefined),
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplify,
		});
	});

	describe('legacy ContextSpec path', () => {
		it('get should call common get API with bridged server-side Amplify context', () => {
			get(contextSpec, input);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
			expect(commonGet).toHaveBeenCalledWith(
				expect.objectContaining({
					libraryOptions: mockAmplify.libraryOptions,
					fetchAuthSession: expect.any(Function),
					clearCredentials: expect.any(Function),
					getTokens: expect.any(Function),
				}),
				input,
			);
		});

		it('post should call common post API with bridged server-side Amplify context', () => {
			post(contextSpec, input);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
			expect(commonPost).toHaveBeenCalledWith(
				expect.objectContaining({
					fetchAuthSession: expect.any(Function),
				}),
				input,
			);
		});

		it('put should call common put API with bridged server-side Amplify context', () => {
			put(contextSpec, input);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
			expect(commonPut).toHaveBeenCalledWith(
				expect.objectContaining({
					fetchAuthSession: expect.any(Function),
				}),
				input,
			);
		});

		it('del should call common del API with bridged server-side Amplify context', () => {
			del(contextSpec, input);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
			expect(commonDel).toHaveBeenCalledWith(
				expect.objectContaining({
					fetchAuthSession: expect.any(Function),
				}),
				input,
			);
		});

		it('patch should call common patch API with bridged server-side Amplify context', () => {
			patch(contextSpec, input);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
			expect(commonPatch).toHaveBeenCalledWith(
				expect.objectContaining({
					fetchAuthSession: expect.any(Function),
				}),
				input,
			);
		});

		it('head should call common head API with bridged server-side Amplify context', () => {
			head(contextSpec, input);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
			expect(commonHead).toHaveBeenCalledWith(
				expect.objectContaining({
					fetchAuthSession: expect.any(Function),
				}),
				input,
			);
		});
	});

	describe('AmplifyContext path', () => {
		it('get should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			get(ctx, input);
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
			expect(commonGet).toHaveBeenCalledWith(ctx, input);
		});

		it('post should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			post(ctx, input);
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
			expect(commonPost).toHaveBeenCalledWith(ctx, input);
		});

		it('put should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			put(ctx, input);
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
			expect(commonPut).toHaveBeenCalledWith(ctx, input);
		});

		it('del should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			del(ctx, input);
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
			expect(commonDel).toHaveBeenCalledWith(ctx, input);
		});

		it('patch should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			patch(ctx, input);
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
			expect(commonPatch).toHaveBeenCalledWith(ctx, input);
		});

		it('head should pass AmplifyContext directly without calling getAmplifyServerContext', () => {
			const ctx = createMockAmplifyContext();
			head(ctx, input);
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
			expect(commonHead).toHaveBeenCalledWith(ctx, input);
		});
	});
});
