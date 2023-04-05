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
	return buildUserAgent(customUserAgent);
};

const buildUserAgent = (customUserAgent?: CustomUserAgent): AWSUserAgent => {
	const userAgent: AWSUserAgent = [[BASE_USER_AGENT, version]];
	if (customUserAgent?.category) {
		/** TODO: add action as second element */
		userAgent.push([customUserAgent.category, undefined]);
	}

	if (customUserAgent?.framework) {
		userAgent.push(['framework', customUserAgent.framework]);
	} else {
		userAgent.push(['framework', detectFramework()]);
	}

	return userAgent;
};

export const getAmplifyUserAgentString = (
	customUserAgent?: CustomUserAgent
): string => {
	const userAgent = buildUserAgent(customUserAgent);
	const userAgentDetailsString = userAgent
		.map(([agentKey, agentValue]) => `${agentKey}/${agentValue ?? ''}`)
		.join(' ');

	return userAgentDetailsString.trimEnd();
};
