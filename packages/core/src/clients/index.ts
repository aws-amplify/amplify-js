// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { getDnsSuffix } from './endpoints';

export { fetchTransferHandler } from './handlers/fetch';
export { unauthenticatedHandler } from './handlers/unauthenticated';
export { authenticatedHandler } from './handlers/authenticated';
export {
	signRequest,
	presignUrl,
} from './middleware/signing/signer/signatureV4';
export { signingMiddleware, SigningOptions } from './middleware/signing';
export { getHashedPayload } from './middleware/signing/signer/signatureV4';
export {
	getRetryDecider,
	jitteredBackoff,
	retryMiddleware,
	RetryOptions,
} from './middleware/retry';
export { userAgentMiddleware, UserAgentOptions } from './middleware/userAgent';
export { parseJsonBody, parseJsonError, parseMetadata } from './serde';
export * from './types';
