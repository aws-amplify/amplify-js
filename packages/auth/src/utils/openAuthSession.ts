// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OpenAuthSession } from './types';

export const openAuthSession: OpenAuthSession = async (
	url: string,
	_redirectUrls: string[],
	_preferPrivateSession?: boolean,
	urlOpener: (_url: string) => Promise<void> = async (_url: string) => {
		window.location.href = _url;
	},
) => {
	if (!window?.location) {
		return;
	}

	// enforce HTTPS
	const secureUrl = url.replace('http://', 'https://');

	// Call the provided or default urlOpener
	await urlOpener(secureUrl);
};
