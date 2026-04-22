// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated Server-specific imports are no longer needed.
 * Use {@link aws-amplify/storage | aws-amplify/storage} directly — all APIs now accept
 * an optional `AmplifyContext` as the first argument.
 *
 * @example
 * ```ts
 * // Before:
 * import { getUrl } from "aws-amplify/storage/server";
 * getUrl(contextSpec, { path: "photo.jpg" });
 *
 * // After:
 * import { getUrl } from "aws-amplify/storage";
 * getUrl(ctx, { path: "photo.jpg" });
 * ```
 */
export * from '.';
