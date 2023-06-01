/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { version } from './version';
import { Framework } from './constants';
import { detectFramework } from './detectFramework';

const BASE_USER_AGENT = `aws-amplify/${version}`;

export const Platform = {
	userAgent: BASE_USER_AGENT,
	framework,
	isReactNative: isReactNative(),
};

const isReactNative = () =>
	typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

export const getUserAgent = () => {
	return Platform.userAgent;
};

/**
 * @deprecated use named import
 */
export default Platform;
