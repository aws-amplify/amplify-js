// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	KeyValueStorageMethodValidator,
	CookieStorage,
} from '@aws-amplify/core/internals/adapter-core';
export { OAuthConfig } from '@aws-amplify/core';
export {
	assertOAuthConfig,
	assertTokenProviderConfig,
	urlSafeEncode,
	decodeJWT,
	LegacyConfig,
	AmplifyOutputsUnknown,
} from '@aws-amplify/core/internals/utils';

// Deprecated stubs — kept for adapter-nextjs compilation until it migrates to configure()

/** @deprecated Will be removed once adapter-nextjs migrates to configure(). */
export class AmplifyServerContextError extends Error {
	constructor(params: { message: string; recoverySuggestion?: string }) {
		super(params.message);
		this.name = 'AmplifyServerContextError';
	}
}

/** @deprecated Will be removed once adapter-nextjs migrates to configure(). */
export function getAmplifyServerContext(_contextSpec: any): any {
	throw new AmplifyServerContextError({
		message:
			'getAmplifyServerContext is no longer supported. Use configure() to create an AmplifyContext instead.',
	});
}

/** @deprecated Will be removed once adapter-nextjs migrates to configure(). */
export namespace AmplifyServer {
	export type ContextSpec = { token: { value: symbol } };
	export type ContextToken = { value: symbol };
	export interface RunOperationWithContext {
		<Result>(input: {
			operation: (contextSpec: ContextSpec) => Result | Promise<Result>;
			[key: string]: any;
		}): Promise<Result>;
	}
}
