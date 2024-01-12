// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession as fetchAuthSessionInternal } from './internal/fetchAuthSession';
import { Amplify } from '../Amplify';
import { FetchAuthSessionOptions } from '../Auth/types';

export const fetchAuthSession = (options?: FetchAuthSessionOptions) => {
	return fetchAuthSessionInternal(Amplify, options);
};
