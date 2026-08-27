// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

/**
 * @deprecated Use {@link AmplifyContext} directly instead. This namespace is
 * retained only for backwards compatibility with consumers (e.g. adapter
 * packages) that still reference `AmplifyServer.ContextSpec`.
 */
export declare namespace AmplifyServer {
	/** @deprecated Use {@link AmplifyContext} instead. */
	export type ContextSpec = AmplifyContext;
}
