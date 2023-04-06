// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomUserAgent, Framework } from './types';
import { version } from './version';
import { detectFramework } from './detectFramework';
import { UserAgent as AWSUserAgent } from '@aws-sdk/types';

const BASE_USER_AGENT = `aws-amplify`;

const framework = detectFramework();
export const Platform = {
	userAgent: `${BASE_USER_AGENT}/${version}`,
	framework,
	isReactNative: framework === Framework.ReactNative,
};

export const getAmplifyUserAgent = ({
	category,
	framework,
}: CustomUserAgent = {}): AWSUserAgent => {
	const userAgent: AWSUserAgent = [[BASE_USER_AGENT, version]];
	if (category) {
		/** TODO: add action as second element */
		userAgent.push([category, undefined]);
	}
	userAgent.push(['framework', framework ? framework : Platform.framework]);

	return userAgent;
};

export const getAmplifyUserAgentString = (
	customUserAgent?: CustomUserAgent
): string => {
	const userAgent = getAmplifyUserAgent(customUserAgent);
	const userAgentDetailsString = userAgent
		.map(([agentKey, agentValue]) => `${agentKey}/${agentValue ?? ''}`)
		.join(' ');

	return userAgentDetailsString.trimEnd();
};
