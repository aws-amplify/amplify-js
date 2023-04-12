// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials, HttpRequest } from '../../../../../types';

export interface SignRequestOptions {
	credentials: Credentials;
	signingDate?: Date;
	signingRegion: string;
	signingService: string;
}

export interface SignUrlOptions extends SignRequestOptions {
	expiration?: number;
}

export interface Presignable extends Pick<HttpRequest, 'body' | 'url'> {
	method?: HttpRequest['method'];
}
