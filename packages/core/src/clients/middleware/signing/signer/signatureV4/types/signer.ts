// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials, HttpRequest } from '../../../../../types';

export interface SignRequestOptions {
	credentials: Credentials;
	signingDate?: Date;
	signingRegion: string;
	signingService: string;

	/**
	 * Whether to uri encode the path as part of canonical uri. It's used for S3 only where the pathname
	 * is already uri encoded, and the signing process is not expected to uri encode it again.
	 *
	 * @default true
	 *
	 * @see https://github.com/aws/aws-sdk-js-v3/blob/9ba012dfa3a3429aa2db0f90b3b0b3a7a31f9bc3/packages/signature-v4/src/SignatureV4.ts#L76-L83
	 */
	uriEscapePath?: boolean;
}

export interface PresignUrlOptions extends SignRequestOptions {
	expiration?: number;
}

export interface Presignable extends Pick<HttpRequest, 'body' | 'url'> {
	method?: HttpRequest['method'];
}

export interface FormattedDates {
	longDate: string;
	shortDate: string;
}

export interface SigningValues
	extends Credentials,
		FormattedDates,
		Pick<
			SignRequestOptions,
			'signingRegion' | 'signingService' | 'uriEscapePath'
		> {
	credentialScope: string;
}
