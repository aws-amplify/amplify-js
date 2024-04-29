// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../Amplify';
import { AuthSession, FetchAuthSessionOptions } from '../Auth/types';

import { fetchAuthSession as fetchAuthSessionInternal } from './internal/fetchAuthSession';

export const fetchAuthSession = (
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> => {
	return fetchAuthSessionInternal(Amplify, options);
};
