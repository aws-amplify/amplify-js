// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../context/AmplifyContext';
import { LibraryOptions, ResourcesConfig } from '../singleton/types';

/**
 * @deprecated Use {@link AmplifyContext} directly instead. This namespace is
 * retained only for backwards compatibility with consumers (e.g. adapter
 * packages) that still reference the removed server-context types
 * (`AmplifyServer.ContextSpec`, `Context`, `ContextToken`,
 * `RunOperationWithContext`). All of these now map onto the branded
 * {@link AmplifyContext} model. Mirrors the compat surface exported from
 * `aws-amplify/adapter-core`.
 */
export declare namespace AmplifyServer {
	/** @deprecated Use {@link AmplifyContext} instead. */
	export type ContextSpec = AmplifyContext;

	/**
	 * @deprecated The server-context registry (and its opaque token) has been
	 * removed in favor of the branded {@link AmplifyContext} model. This shape
	 * is preserved only so existing type references keep compiling.
	 */
	export interface ContextToken {
		readonly value: symbol;
	}

	/**
	 * @deprecated Use {@link AmplifyContext} instead. The deleted original
	 * wrapped the per-context `AmplifyClass`; that role is now filled by the
	 * branded {@link AmplifyContext}, so `amplify` is typed as an
	 * {@link AmplifyContext}.
	 */
	export interface Context {
		amplify: AmplifyContext;
	}

	/**
	 * @deprecated The server-context manager has been removed in favor of the
	 * branded {@link AmplifyContext} model. Prefer building a context explicitly
	 * with `createAmplifyContext()`. Mirrors the deleted original, with the
	 * operation's `contextSpec` argument mapped onto {@link ContextSpec}
	 * (i.e. {@link AmplifyContext}).
	 */
	export type RunOperationWithContext = <Result>(
		amplifyConfig: ResourcesConfig,
		libraryOptions: LibraryOptions,
		operation: (
			contextSpec: AmplifyServer.ContextSpec,
		) => Result | Promise<Result>,
	) => Promise<Result>;
}
