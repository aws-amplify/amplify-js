// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	post as internalPost,
	GraphQlPostInput,
} from '../internal/graphQlPost';

export const post = (
	contextSpec: AmplifyServer.ContextSpec,
	input: GraphQlPostInput
) => {
	return internalPost(getAmplifyServerContext(contextSpec).amplify, input);
};

export { cancel } from '../internal/graphQlPost';
