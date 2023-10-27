// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer, getAmplifyServerContext } from '../../../adapterCore';
import { AuthSession, FetchAuthSessionOptions } from '../../Auth/types';
import { fetchAuthSession as fetchAuthSessionInternal } from '../internal/fetchAuthSession';

export const fetchAuthSession = (
	contextSpec: AmplifyServer.ContextSpec,
	options?: FetchAuthSessionOptions
): Promise<AuthSession> => {
	return fetchAuthSessionInternal(
		getAmplifyServerContext(contextSpec).amplify,
		options
	);
};
