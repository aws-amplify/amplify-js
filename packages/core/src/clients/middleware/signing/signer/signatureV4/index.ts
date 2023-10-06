// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import './polyfills';

// TODO: V6 replace Signer
export { signRequest } from './signRequest';
export { presignUrl } from './presignUrl';
export { TOKEN_QUERY_PARAM } from './constants';
export { getHashedPayload } from './utils/getHashedPayload';
export type { SignRequestOptions, PresignUrlOptions } from './types';
