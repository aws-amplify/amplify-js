// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// a regular expression that validates the origin string to be any valid origin, and allowing local development localhost
const originRegex =
	/^(http:\/\/localhost(:\d{1,5})?)|(https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*(:\d{1,5})?)$/;

export const isValidOrigin = (origin: string): boolean => {
	try {
		const url = new URL(origin);

		if (url.protocol === 'http:' && url.hostname !== 'localhost') {
			console.warn(
				'HTTP origin detected. This is insecure and should only be used for local development.',
			);
		}

		return (
			(url.protocol === 'http:' || url.protocol === 'https:') &&
			originRegex.test(origin)
		);
	} catch {
		return false;
	}
};

export const isSSLOrigin = (origin: string): boolean => {
	if (isValidOrigin(origin)) {
		return origin.startsWith('https://');
	}

	return false;
};
