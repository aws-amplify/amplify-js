/* eslint-disable import/no-relative-packages */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

import { SignInInput, SignInOutput } from '../../src';

/**
 * Signs a user in (Server Layer)
 */
export async function signIn(
	contextSpec: AmplifyServer.ContextSpec,
	input: SignInInput,
): Promise<SignInOutput> {
	console.log('🔍 Server signIn API called with:', { contextSpec, input });

	// @ts-expect-error TODO: Implement server-specific signIn logic
	return {};
}
