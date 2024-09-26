// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserAgent as AWSUserAgent } from '@aws-sdk/types';

import { CustomUserAgentDetails, Framework } from './types';
import { version } from './version';
import { detectFramework, observeFrameworkChanges } from './detectFramework';
import { getCustomUserAgent } from './customUserAgent';

const BASE_USER_AGENT = `aws-amplify`;

class PlatformBuilder {
	userAgent = `${BASE_USER_AGENT}/${version}`;
	get framework() {
		return detectFramework();
	}

	get isReactNative() {
		return (
			this.framework === Framework.ReactNative ||
			this.framework === Framework.Expo
		);
	}

	observeFrameworkChanges(fcn: () => void) {
		observeFrameworkChanges(fcn);
	}
}

export const Platform = new PlatformBuilder();

export const getAmplifyUserAgentObject = ({
	category,
	action,
}: CustomUserAgentDetails = {}): AWSUserAgent => {
	const userAgent: AWSUserAgent = [[BASE_USER_AGENT, version]];
	if (category) {
		userAgent.push([category, action]);
	}
	userAgent.push(['framework', detectFramework()]);

	if (category && action) {
		const customState = getCustomUserAgent(category, action);

		if (customState) {
			customState.forEach(state => {
				userAgent.push(state);
			});
		}
	}

	return userAgent;
};

export const getAmplifyUserAgent = (
	customUserAgentDetails?: CustomUserAgentDetails,
): string => {
	const userAgent = getAmplifyUserAgentObject(customUserAgentDetails);
	const userAgentString = userAgent
		.map(([agentKey, agentValue]) =>
			agentKey && agentValue ? `${agentKey}/${agentValue}` : agentKey,
		)
		.join(' ');

	return userAgentString;
};
