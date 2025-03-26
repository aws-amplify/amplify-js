// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { getDnsSuffix } from './endpoints';

export { fetchTransferHandler } from './handlers/fetch';
export { unauthenticatedHandler } from './handlers/aws/unauthenticated';
export { authenticatedHandler } from './handlers/aws/authenticated';
export {
	getHashedPayload,
	presignUrl,
	signRequest,
	PresignUrlOptions,
	SignRequestOptions,
} from './middleware/signing/signer/signatureV4';
export { EMPTY_HASH as EMPTY_SHA256_HASH } from './middleware/signing/signer/signatureV4/constants';
export { extendedEncodeURIComponent } from './middleware/signing/utils/extendedEncodeURIComponent';
export {
	signingMiddlewareFactory,
	SigningOptions,
	CredentialsProviderOptions,
} from './middleware/signing';
export {
	getRetryDecider,
	jitteredBackoff,
	retryMiddlewareFactory,
	amzSdkInvocationIdHeaderMiddlewareFactory,
	amzSdkRequestHeaderMiddlewareFactory,
	RetryDeciderOutput,
	RetryOptions,
	AmzSdkRequestHeaderMiddlewareOptions,
} from './middleware/retry';
export {
	userAgentMiddlewareFactory,
	UserAgentOptions,
} from './middleware/userAgent';
export { parseJsonBody, parseJsonError, parseMetadata } from './serde';
export { withMemoization } from './utils/memoization';
export * from './types';
