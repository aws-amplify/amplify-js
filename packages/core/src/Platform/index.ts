// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomUserAgent } from '../types/types';
import { version } from './version';
import { detectFramework } from './detectFramework';

const BASE_USER_AGENT = `aws-amplify/${version}`;

export const Platform = {
	userAgent: BASE_USER_AGENT,
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

export const getAmplifyUserAgent = (customUserAgent?: CustomUserAgent) => {
	return `${Platform.userAgent} ${buildUserAgentDetails(customUserAgent)}`;
};

const buildUserAgentDetails = (customUserAgent?: CustomUserAgent) => {
	const userAgentDetails = { framework: detectFramework(), ...customUserAgent };
	return `(${Object.values(userAgentDetails).sort().toString()})`;
};
