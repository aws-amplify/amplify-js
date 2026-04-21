// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, ResourcesConfig, getActiveContext } from '@aws-amplify/core';
import { isBrowser } from '@aws-amplify/core/internals/utils';

import { attemptCompleteOAuthFlow } from './attemptCompleteOAuthFlow';

// Attach the side effect for handling the completion of an inflight OAuth flow.
// This side effect works only on Web.
isBrowser() &&
	Hub.listen('core', ({ payload }) => {
		if (payload.event === 'configure') {
			const data = payload.data as ResourcesConfig | undefined;
			if (data?.Auth?.Cognito?.loginWith?.oauth) {
				attemptCompleteOAuthFlow(getActiveContext(), data.Auth.Cognito);
			}
		}
	});

// required to be present for module loaders
export {};
