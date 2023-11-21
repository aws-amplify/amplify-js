// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClass } from '~/src/singleton/Amplify';
import {
	AuthSession,
	FetchAuthSessionOptions,
} from '~/src/singleton/Auth/types';

export const fetchAuthSession = (
	amplify: AmplifyClass,
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> => {
	return amplify.Auth.fetchAuthSession(options);
};
