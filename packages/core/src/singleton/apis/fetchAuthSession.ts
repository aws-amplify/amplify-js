// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession as fetchAuthSessionInternal } from './internal/fetchAuthSession';
import { Amplify } from '../Amplify';
import { FetchAuthSessionOptions } from '../Auth/types';
import { debounceCallback } from '../../utils/debounceCallback';

export const fetchAuthSession = debounceCallback(
	async (options?: FetchAuthSessionOptions) => {
		return fetchAuthSessionInternal(Amplify, options);
	},
	300
);
