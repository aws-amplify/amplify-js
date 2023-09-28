// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyWebBrowser,
	OpenAuthSession,
	OpenAuthSessionResult,
} from './types';

const RTN_MODULE = '@aws-amplify/rtn-web-browser';

let webBrowser: AmplifyWebBrowser;

try {
	webBrowser = require(RTN_MODULE)?.AmplifyRTNWebBrowser;
	if (!webBrowser) {
		throw new Error();
	}
} catch (err) {
	throw new Error(`Unable to find ${RTN_MODULE}. Did you install it?`);
}

export const openAuthSession: OpenAuthSession = async (
	url: string,
	redirectSchemes: string[]
): Promise<OpenAuthSessionResult> => {
	try {
		const redirectUrl = await webBrowser.openAuthSessionAsync(
			url,
			redirectSchemes
		);
		if (!redirectUrl) {
			return { type: 'canceled' };
		}
		return { type: 'success', url: redirectUrl };
	} catch (err) {
		return { type: 'unknown' };
	}
};
