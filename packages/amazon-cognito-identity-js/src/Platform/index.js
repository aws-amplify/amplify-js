/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
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
	if (navigator.product === 'ReactNative') {
		Platform.isReactNative = true;
	}
}

export const getUserAgent = () => {
	return Platform.userAgent;
};

/**
 * @deprecated use named import
 */
export default Platform;
