// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer, getAmplifyServerContext } from '../../../adapterCore';
import { AuthSession, FetchAuthSessionOptions } from '../../Auth/types';

export const fetchAuthSession = (
	contextSpec: AmplifyServer.ContextSpec,
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> =>
	getAmplifyServerContext(contextSpec).amplify.fetchAuthSession(options);
