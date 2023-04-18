// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomUserAgentDetails, Framework } from './types';
import { version } from './version';
import { detectFramework } from './detectFramework';
import { UserAgent as AWSUserAgent } from '@aws-sdk/types';

const BASE_USER_AGENT = `aws-amplify`;

let framework = detectFramework();
let frameworkHasBeenRerun = false;
export const Platform = {
	userAgent: `${BASE_USER_AGENT}/${version}`,
	framework,
	isReactNative: framework === Framework.ReactNative,
};

/**
 * Rerun framework detection once when getAmplifyUserAgent is called if framework is None.
 * ReactNative framework must be detected initially, however other frameworks may not be 
 * detected in cases where DOM is not yet loaded.
 */
const rerunFrameworkDetection = () => {
	if (Platform.framework === Framework.None && !frameworkHasBeenRerun) {
        framework = detectFramework();
		frameworkHasBeenRerun = true;
		Platform.framework = framework;
	}
};

export const getAmplifyUserAgent = ({
	category,
	action,
	framework,
}: CustomUserAgentDetails = {}): AWSUserAgent => {
	rerunFrameworkDetection();
	const userAgent: AWSUserAgent = [[BASE_USER_AGENT, version]];
	if (category) {
		/** TODO: add action as second element */
		userAgent.push([category, action]);
	}
	userAgent.push(['framework', framework ? framework : Platform.framework]);

	return userAgent;
};

export const getAmplifyUserAgentString = (
	customUserAgentDetails?: CustomUserAgentDetails
): string => {
	const userAgent = getAmplifyUserAgent(customUserAgentDetails);
	const userAgentString = userAgent
		.map(([agentKey, agentValue]) => `${agentKey}/${agentValue}`)
		.join(' ');

	return userAgentString;
};
