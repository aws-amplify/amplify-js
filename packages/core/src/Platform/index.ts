// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CodedUserAgentSuffix,
	Platform as PlatformType,
	UserAgentSuffix,
} from '../types/types';
import { version } from './version';

const BASE_USER_AGENT = 'aws-amplify/';

export const Platform: PlatformType = {
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
			Platform.userAgent = `${BASE_USER_AGENT} react-native`;
			Platform.isReactNative = true;
			break;
		default:
			Platform.userAgent = `${BASE_USER_AGENT} js`;
			Platform.isReactNative = false;
			break;
	}
}

export const getAmplifyUserAgent = (userAgentSuffix?: UserAgentSuffix) => {
	return `${Platform.userAgent}${buildUserAgentSuffix(userAgentSuffix)}`;
};

const buildUserAgentSuffix = (userAgentSuffix?: UserAgentSuffix) => {
	let codedSuffix: CodedUserAgentSuffix = {
		v: version,
	};
	if (userAgentSuffix) {
		codedSuffix.c = userAgentSuffix.component;
		codedSuffix.f = userAgentSuffix.framework || detectFrameworks();
		codedSuffix.a = userAgentSuffix.action;
		codedSuffix.ui = userAgentSuffix.component;
	}
	return JSON.stringify(codedSuffix);
};

const detectFrameworks = () => {
	let frameworks = '';

	if (
		Array.from(document.querySelectorAll('*')).some(e =>
			e.hasOwnProperty('_reactRootContainer')
		)
	) {
		frameworks += 'React.js|';
	}

	if (document.querySelector('script[id=__NEXT_DATA__]')) {
		frameworks += 'Next.js|';
	}

	if (
		window.hasOwnProperty('angular') ||
		document.querySelector(
			'.ng-binding, [ng-app], [data-ng-app], [ng-controller], [data-ng-controller], [ng-repeat], [data-ng-repeat]'
		) ||
		document.querySelector(
			'script[src*="angular.js"], script[src*="angular.min.js"]'
		)
	) {
		frameworks += 'Angular.js|';
	}

	if (window.hasOwnProperty('getAllAngularRootElements') || windowHasNgZone()) {
		frameworks += 'Angular 2+|';
	}

	if (window.hasOwnProperty('Vue')) {
		frameworks += 'Vue.js';
	}
	if (window.hasOwnProperty('jQuery')) {
		frameworks += 'jQuery.js';
	}

	if (!frameworks) {
		return 'JS';
	}
	return frameworks;
};

const windowHasNgZone = () => {
	return (
		window.hasOwnProperty('ng') &&
		window['ng'].hasOwnProperty('coreTokens') &&
		window['ng']['coreTokens'].hasOwnProperty('NgZone')
	);
};
