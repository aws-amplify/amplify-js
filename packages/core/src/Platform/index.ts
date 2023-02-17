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
		f: detectFramework(),
	};
	if (userAgentSuffix) {
		codedSuffix.c = userAgentSuffix.component;
		codedSuffix.a = userAgentSuffix.action;
		codedSuffix.ui = userAgentSuffix.component;
	}
	return JSON.stringify(codedSuffix);
};

const detectFrameworks = () => {
	let frameworks = '';

	if (
		Array.from(document.querySelectorAll('*')).some(
			e => e._reactRootContainer !== undefined
		)
	)
		console.log('React.js');

	if (!!document.querySelector('script[id=__NEXT_DATA__]'))
		frameworks += 'Next.js|';

	if (!!document.querySelector('[id=___gatsby]')) {
		frameworks += 'Gatsby.js|';
	}

	if (
		!!window.angular ||
		!!document.querySelector(
			'.ng-binding, [ng-app], [data-ng-app], [ng-controller], [data-ng-controller], [ng-repeat], [data-ng-repeat]'
		) ||
		!!document.querySelector(
			'script[src*="angular.js"], script[src*="angular.min.js"]'
		)
	)
		frameworks += 'Angular.js|';

	if (!!window.getAllAngularRootElements || !!window.ng?.coreTokens?.NgZone)
		console.log('Angular 2+|');

	if (!!window.Backbone) console.log('Backbone.js');
	if (!!window.Ember) console.log('Ember.js');
	if (!!window.Vue) console.log('Vue.js');
	if (!!window.Meteor) console.log('Meteor.js');
	if (!!window.Zepto) console.log('Zepto.js');
	if (!!window.jQuery) console.log('jQuery.js');

	if (!frameworks) {
		return 'JS';
	}
	return frameworks;
};
