/* eslint-disable unused-imports/no-unused-vars */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { GetPropertiesInput, GetPropertiesOutput } from '../types';

import { getProperties as getPropertiesInternal } from './internal/getProperties';

export const getProperties = (
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput> => getPropertiesInternal(Amplify, input);

// const wrapper = (input: GetPropertiesInput) => {
// 	const { key, path, options } = input;
// 	const { accessLevel } = options!;

// 	return getProperties(input);
// };

// getProperties({
// 	key: '',
// 	options: { accessLevel: 'protected', targetIdentityId: '' },
// });

// getProperties({ path: '' });

// getProperties({ key: '', path: '', options: { accessLevel: 'guest' } });
