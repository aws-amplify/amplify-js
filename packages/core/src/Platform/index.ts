// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomUserAgent } from './types';
import { version } from './version';
import { detectFramework } from './detectFramework';
import { UserAgent as AWSUserAgent } from '@aws-sdk/types';

const BASE_USER_AGENT = `aws-amplify`;

export const Platform = {
	userAgent: `${BASE_USER_AGENT}/${version}`,
	product: '',
	navigator: null,
	isReactNative: false,
};
if (typeof navigator !== 'undefined' && navigator.product) {
	Platform.product = navigator.product || '';
	Platform.navigator = navigator || null;
	if (navigator.product === 'ReactNative') {
		Platform.isReactNative = true;
	}
}

export const getAmplifyUserAgent = (
	customUserAgent?: CustomUserAgent
): AWSUserAgent => {
	return buildUserAgentTuples(customUserAgent);
};

export const getAmplifyUserAgentString = (
	customUserAgent?: CustomUserAgent
): string => {
	return buildUserAgentDetailsString(customUserAgent);
};

const buildUserAgentTuples = (
	customUserAgent?: CustomUserAgent
): AWSUserAgent => {
	const userAgentDetails = {
		...customUserAgent,
	};
	const userAgentTuples: AWSUserAgent = [[BASE_USER_AGENT, version]];
	if (userAgentDetails.category) {
		userAgentTuples.push([userAgentDetails.category, userAgentDetails.action]);
	}

	if (userAgentDetails.framework) {
		userAgentTuples.push(['framework', userAgentDetails.framework]);
	} else {
		userAgentTuples.push(['framework', detectFramework()]);
	}
	π;

	return userAgentTuples;
};

const buildUserAgentDetailsString = (
	customUserAgent?: CustomUserAgent
): string => {
	const userAgentTuples = buildUserAgentTuples(customUserAgent);
	let userAgentDetailsString = '';
	for (let i = 0; i < userAgentTuples.length; i++) {
		userAgentDetailsString += `${userAgentTuples[i][0]}${
			userAgentTuples[i][1] ? `/${userAgentTuples[i][1]}` : ''
		} `;
	}

	return userAgentDetailsString.trimEnd();
};
