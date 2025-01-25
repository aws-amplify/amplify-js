// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
export { createKeyValueStorageFromCookieStorageAdapter } from './storageFactories';
export {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './authProvidersFactories/cognito';
export {
	/** @deprecated This type is deprecated and will be removed in future versions. */
	LegacyConfig,
	/** @deprecated This type is deprecated and will be removed in future versions. */
	AmplifyOutputs,
} from '@aws-amplify/core/internals/utils';
export {
	AmplifyServer,
	CookieStorage,
} from '@aws-amplify/core/internals/adapter-core';
