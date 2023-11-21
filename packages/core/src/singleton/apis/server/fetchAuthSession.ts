// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer, getAmplifyServerContext } from '~/src/adapterCore';
import {
	AuthSession,
	FetchAuthSessionOptions,
} from '~/src/singleton/Auth/types';
import { fetchAuthSession as fetchAuthSessionInternal } from '~/src/singleton/apis/internal/fetchAuthSession';

export const fetchAuthSession = (
	contextSpec: AmplifyServer.ContextSpec,
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> => {
	return fetchAuthSessionInternal(
		getAmplifyServerContext(contextSpec).amplify,
		options,
	);
};
