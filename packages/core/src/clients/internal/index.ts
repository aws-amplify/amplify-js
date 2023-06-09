// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * This index should NOT be included in the ../index.ts because the composer functions
 * here requires TypeScript >= 4. Given other scoped packages may use TypeScript < 4,
 * they should not be exposed to upper level index.
 */
export { composeServiceApi } from './composeServiceApi';
export { composeTransferHandler } from './composeTransferHandler';
