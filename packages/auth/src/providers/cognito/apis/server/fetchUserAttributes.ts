// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { FetchUserAttributesOutput } from '../../types';
import { fetchUserAttributes as fetchUserAttributesInternal } from '../internal/fetchUserAttributes';

export const fetchUserAttributes = (
	contextSpec: AmplifyServer.ContextSpec
): Promise<FetchUserAttributesOutput> => {
	return fetchUserAttributesInternal(
		getAmplifyServerContext(contextSpec).amplify
	);
};
