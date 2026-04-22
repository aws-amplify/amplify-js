// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated Server-specific imports are no longer needed.
 * Use {@link @aws-amplify/auth | @aws-amplify/auth} directly — all APIs now accept
 * an optional `AmplifyContext` as the first argument.
 *
 * @example
 * ```ts
 * // Before:
 * import { fetchUserAttributes } from "@aws-amplify/auth/server";
 * fetchUserAttributes(contextSpec);
 *
 * // After:
 * import { fetchUserAttributes } from "@aws-amplify/auth";
 * fetchUserAttributes(ctx, { /* options *​/ });
 * ```
 */
export * from '.';
