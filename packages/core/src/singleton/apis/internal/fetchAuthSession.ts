// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../AmplifyContext';
import { AuthSession, FetchAuthSessionOptions } from '../../Auth/types';

export const fetchAuthSession = (
	amplify: AmplifyContext,
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> => {
	return amplify.fetchAuthSession(options);
};
