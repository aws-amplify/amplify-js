// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Pattern 6 (Phase C4): fetchUserAttributes/getCurrentUser are bare re-exports
// of the ctx-native main APIs. They accept `(ctx, input)` via overloads, so no
// server-specific wrapper is needed — the caller supplies a branded
// `AmplifyContext` as the first argument.
export { fetchUserAttributes, getCurrentUser } from '../..';

// Multi-session server APIs keep dedicated wrappers: their server behavior
// differs from the client variants (they do NOT emit a `switchActiveUser` Hub
// event), and they reach the non-destructive session switcher through the
// per-request context (`ctx.libraryOptions.Auth.tokenProvider`) rather than any
// global singleton. The HLD's server semantics are authoritative here.
export { listCurrentUsers } from './listCurrentUsers';
export { setCurrentUser } from './setCurrentUser';
