// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession as fetchAuthSessionInternal } from './internal/fetchAuthSession';
import { AmplifyV6 } from '../Amplify';
import { AuthSession, FetchAuthSessionOptions } from '../Auth/types';

export const fetchAuthSession = (
	options?: FetchAuthSessionOptions
): Promise<AuthSession> => {
	return fetchAuthSessionInternal(AmplifyV6, options);
};
