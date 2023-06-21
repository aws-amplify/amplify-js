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
