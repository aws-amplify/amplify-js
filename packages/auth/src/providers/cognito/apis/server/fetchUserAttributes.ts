// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { FetchUserAttributesOutput } from '~/src/providers/cognito/types';
import { fetchUserAttributes as fetchUserAttributesInternal } from '~/src/providers/cognito/apis/internal/fetchUserAttributes';

export const fetchUserAttributes = (
	contextSpec: AmplifyServer.ContextSpec,
): Promise<FetchUserAttributesOutput> => {
	return fetchUserAttributesInternal(
		getAmplifyServerContext(contextSpec).amplify,
	);
};
