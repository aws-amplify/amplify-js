// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CodedUserAgentSuffix,
	Platform as PlatformType,
	UserAgentSuffix,
} from '../types/types';
import { version } from './version';

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
	switch (navigator.product) {
		case 'ReactNative':
			Platform.isReactNative = true;
			break;
		default:
			Platform.isReactNative = false;
			break;
	}
}

export const getAmplifyUserAgent = (userAgentSuffix?: UserAgentSuffix) => {
	return `${Platform.userAgent} ${buildUserAgentSuffix(userAgentSuffix)}`;
};

const buildUserAgentSuffix = (userAgentSuffix?: UserAgentSuffix) => {
	const codedSuffix: CodedUserAgentSuffix = {
		f: detectFramework(),
	};
	if (userAgentSuffix) {
		codedSuffix.c = userAgentSuffix.category;
		codedSuffix.a = userAgentSuffix.action;
		codedSuffix.ui = userAgentSuffix.component;
	}
	return JSON.stringify(codedSuffix);
};

const detectFramework = () => {
	return 'JS';
};
