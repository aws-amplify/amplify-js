/* eslint-disable unused-imports/no-unused-vars */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { GetUrlInput, GetUrlOutput } from '../types';

import { getUrl as getUrlInternal } from './internal/getUrl';

export const getUrl = (input: GetUrlInput): Promise<GetUrlOutput> =>
	getUrlInternal(Amplify, input);

// const wrapper = (input: GetUrlInput): Promise<GetUrlOutput> => {
// 	const { key, path, options } = input;
// 	const { accessLevel } = options!;

// 	return getUrl(input);
// };

// getUrl({
// 	key: '',
// 	options: { accessLevel: 'protected', targetIdentityId: '' },
// });

// getUrl({ path: '' });

// getUrl({ key: '', path: '', options: { accessLevel: 'guest' } });
