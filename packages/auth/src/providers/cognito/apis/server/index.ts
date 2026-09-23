// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Pattern 6 (Phase C4): bare re-export of the ctx-native main APIs. They accept
// `(ctx, input)` via overloads, so no server-specific wrapper or
// `resolveServerContext` is needed — the caller supplies a branded
// `AmplifyContext` as the first argument.
export { fetchUserAttributes, getCurrentUser } from '../..';
