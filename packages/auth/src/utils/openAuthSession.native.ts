// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyWebBrowser } from '@aws-amplify/react-native';

import { OpenAuthSession, OpenAuthSessionResult } from './types';

export const openAuthSession: OpenAuthSession = async (
	url: string,
	redirectUrls: string[],
	prefersEphemeralSession?: boolean,
): Promise<OpenAuthSessionResult> => {
	try {
		const redirectUrl = await loadAmplifyWebBrowser().openAuthSessionAsync(
			url,
			redirectUrls,
			prefersEphemeralSession,
		);
		if (!redirectUrl) {
			return { type: 'canceled' };
		}

		return { type: 'success', url: redirectUrl };
	} catch (error) {
		return { type: 'error', error };
	}
};
