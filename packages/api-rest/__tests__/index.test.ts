// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { get, post, put, del, patch, head } from '../src/index';
import {
	get as commonGet,
	post as commonPost,
	put as commonPut,
	del as commonDel,
	patch as commonPatch,
	head as commonHead,
} from '../src/common/publicApis';

jest.mock('../src/common/publicApis');
jest.mock('@aws-amplify/core');

const input = {
	apiName: 'apiName',
	path: 'path',
	options: {},
};

describe('REST API handlers', () => {
	it('get should call common get API with client-side Amplify singleton', async () => {
		get(input);
		expect(commonGet).toHaveBeenCalledWith(Amplify, input);
	});

	it('post should call common post API with client-side Amplify singleton', async () => {
		post(input);
		expect(commonPost).toHaveBeenCalledWith(Amplify, input);
	});

	it('put should call common put API with client-side Amplify singleton', async () => {
		put(input);
		expect(commonPut).toHaveBeenCalledWith(Amplify, input);
	});

	it('del should call common del API with client-side Amplify singleton', async () => {
		del(input);
		expect(commonDel).toHaveBeenCalledWith(Amplify, input);
	});

	it('patch should call common patch API with client-side Amplify singleton', async () => {
		patch(input);
		expect(commonPatch).toHaveBeenCalledWith(Amplify, input);
	});

	it('head should call common head API with client-side Amplify singleton', async () => {
		head(input);
		expect(commonHead).toHaveBeenCalledWith(Amplify, input);
	});
});
