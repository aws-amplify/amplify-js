/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { version } from './version';

const BASE_USER_AGENT = `aws-amplify/${version}`;

export const Platform = {
	userAgent: `${BASE_USER_AGENT} js`,
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

export const getUserAgent = () => {
	return Platform.userAgent;
};

/**
 * @deprecated use named import
 */
export default Platform;
