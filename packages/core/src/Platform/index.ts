// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Platform as PlatformType, CustomUserAgent } from '../types/types';
import { version } from './version';
import { detectFramework } from './detectFramework';

const BASE_USER_AGENT = 'aws-amplify';

export const Platform: PlatformType = {
	userAgent: `${BASE_USER_AGENT}/${version}`,
	product: '',
	navigator: null,
	isReactNative: false,
};
if (typeof navigator !== 'undefined' && navigator.product) {
	Platform.product = navigator.product || '';
	Platform.navigator = navigator || null;
	if (navigator.product == 'ReactNative') {
		Platform.isReactNative = true;
	}
}

export const getAmplifyUserAgent = (customUserAgent?: CustomUserAgent) => {
	return `${Platform.userAgent} ${buildUserAgentDetails(customUserAgent)}`;
};

const buildUserAgentDetails = (customUserAgent?: CustomUserAgent) => {
	if (customUserAgent) {
		customUserAgent.framework = customUserAgent.framework ?? detectFramework();
	} else {
		customUserAgent = { framework: detectFramework() };
	}
	return `(${Object.values(customUserAgent).sort().toString()})`;
};
