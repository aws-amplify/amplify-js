// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

/**
 * @private
 *
 * The knobs available for configuring `generateClient` internally.
 */
export type ClientGenerationParams = {
	amplify: AmplifyClassV6;
	authMode?: GraphQLAuthMode;
	authToken?: string;
};
