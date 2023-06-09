// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { getDnsSuffix } from './endpoints';

export { fetchTransferHandler } from './handlers/fetch';
export { unauthenticatedHandler } from './handlers/unauthenticated';
export { authenticatedHandler } from './handlers/authenticated';
export { composeServiceApi } from './internal/composeServiceApi';
export {
	signRequest,
	presignUrl,
} from './middleware/signing/signer/signatureV4';
export { parseJsonBody, parseJsonError, parseMetadata } from './serde';
export * from './types';
