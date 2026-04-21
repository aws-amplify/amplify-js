// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { AmplifyClass, Amplify } from './Amplify';
export { AmplifyContext } from './AmplifyContext';
export { fetchAuthSession } from './apis/fetchAuthSession';
export { clearCredentials } from './apis/clearCredentials';

// Context branding
export { isAmplifyContext, AMPLIFY_CONTEXT_BRAND } from './contextBrand';

// Global context management (public read-only APIs)
export {
	getActiveContext,
	getGlobalContext,
	hasGlobalContext,
} from './globalContext';
