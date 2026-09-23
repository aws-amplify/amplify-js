// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ReadFile } from '../../foundation/types';

/**
 * Server-side `readFile` implementation using `Blob.arrayBuffer()`.
 *
 * `Blob` (and `File`, which extends `Blob`) expose `arrayBuffer()` in
 * Node.js 18+ — this is the canonical way to read blob contents on the
 * server without relying on browser-only `FileReader`.
 */
export const readFile: ReadFile = blob => blob.arrayBuffer();
