// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

import { post as internalPost, GraphQlPostInput } from './internal/graphQlPost';

export const post = (input: GraphQlPostInput) => {
	return internalPost(Amplify, input);
};

export { cancel } from './internal/graphQlPost';
