// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps exports from `@aws-amplify/core/internals/testing`. These are
shared TEST-ONLY helpers (they rely on the ambient `jest` global) for use by
the other Amplify packages' unit tests. Never import this entry from runtime
library code.
*/

export {
	CreateMockAmplifyContextOptions,
	MockAmplifyContext,
	MockResourcesConfig,
	createMockAmplifyContext,
	withTokens,
} from './createMockAmplifyContext';

// Re-exports for one-stop test imports.
export {
	AMPLIFY_CONTEXT_BRAND,
	isAmplifyContext,
} from '../context/contextBrand';
export { AmplifyContext } from '../context/AmplifyContext';
export { ResourcesConfig } from '../singleton/types';
