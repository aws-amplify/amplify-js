// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// `fetchAuthSession` is the overloaded top-level API: `fetchAuthSession(options?)`
// resolves the global AmplifyContext, while `fetchAuthSession(ctx, options?)`
// uses the explicitly-passed (e.g. per-request SSR) context — restoring the
// pre-context v6 SSR calling pattern `fetchAuthSession(contextSpec)`.
export { fetchAuthSession } from './singleton';
