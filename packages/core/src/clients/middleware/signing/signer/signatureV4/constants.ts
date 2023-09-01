// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// query params
export const ALGORITHM_QUERY_PARAM = 'X-Amz-Algorithm';
export const AMZ_DATE_QUERY_PARAM = 'X-Amz-Date';
export const CREDENTIAL_QUERY_PARAM = 'X-Amz-Credential';
export const EXPIRES_QUERY_PARAM = 'X-Amz-Expires';
export const REGION_SET_PARAM = 'X-Amz-Region-Set';
export const SIGNATURE_QUERY_PARAM = 'X-Amz-Signature';
export const SIGNED_HEADERS_QUERY_PARAM = 'X-Amz-SignedHeaders';
export const TOKEN_QUERY_PARAM = 'X-Amz-Security-Token';

// headers
export const AUTH_HEADER = 'authorization';
export const HOST_HEADER = 'host';
export const AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
export const TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();

// identifiers
export const KEY_TYPE_IDENTIFIER = 'aws4_request';
export const SHA256_ALGORITHM_IDENTIFIER = 'AWS4-HMAC-SHA256';
export const SIGNATURE_IDENTIFIER = 'AWS4';

// preset values
export const EMPTY_HASH =
	'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export const UNSIGNED_PAYLOAD = 'UNSIGNED-PAYLOAD';
