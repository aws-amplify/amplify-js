// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from './amplifyUrl';

export const isSecureServiceEndpoint = (input: string): boolean => {
	try {
		const url = new AmplifyUrl(input);

		if (url.protocol === 'http:' && !isLocalhost(url.hostname)) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
};

const isLocalhost = (hostname: string): boolean =>
	hostname === 'localhost' || hostname === '127.0.0.1';
