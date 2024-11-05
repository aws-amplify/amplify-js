// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClass } from '../../Amplify';
import { AuthSession, FetchAuthSessionOptions } from '../../Auth/types';

export const fetchAuthSession = (
	amplify: AmplifyClass,
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> => {
	return amplify.Auth.fetchAuthSession(options);
};
