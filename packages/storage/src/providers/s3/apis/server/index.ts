// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Pattern 6 (Phase C4): the read APIs are bare re-exports of the ctx-native
// main S3 APIs (they already accept `(ctx, input)` via overloads, so the
// previous per-API `resolveServerContext` wrappers are gone). `uploadData`
// keeps a server-specific entry because its task type intentionally omits
// pause/resume across isolated server requests.
export { getProperties, getUrl, list, remove, copy } from '..';
export { uploadData } from '../../../../server/apis';
