// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// a regular expression that validates the origin string to be any valid origin, and allowing local development localhost
const originRegex =
	/^(http:\/\/localhost(:\d{1,5})?)|(https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*(:\d{1,5})?)$/;

export const isValidOrigin = (origin: string | undefined): boolean => {
	const url = createUrlObjectOrUndefined(origin);

	if (!url) {
		return false;
	}

	if (
		url.protocol === 'http:' &&
		url.hostname !== 'localhost' &&
		url.hostname !== '127.0.0.1'
	) {
		console.warn(
			'HTTP origin detected. This is insecure and should only be used for local development.',
		);
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
};

export const isSSLOrigin = (origin: string | undefined): boolean => {
	const url = createUrlObjectOrUndefined(origin);

	if (!url) {
		return false;
	}

	return url.protocol === 'https:';
};

const createUrlObjectOrUndefined = (
	url: string | undefined,
): URL | undefined => {
	if (!url) {
		return undefined;
	}

	// we don't allow format such as `https://localhost:` (without the port number) which is valid in URL constructor
	if (!originRegex.test(url)) {
		return undefined;
	}

	// the `originRegex` ensured a string that can be parsed by URL constructor
	return new URL(url);
};
