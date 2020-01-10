/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { version } from './version';
import { appendToUserAgent } from '@aws-sdk/util-user-agent-browser';
export const Platform = {
	userAgent: `aws-amplify/${version} js`,
	product: '',
	navigator: null,
	isReactNative: false,
};
if (typeof navigator !== 'undefined' && navigator.product) {
	Platform.product = navigator.product || '';
	Platform.navigator = navigator || null;
	switch (navigator.product) {
		case 'ReactNative':
			Platform.userAgent = `aws-amplify/${version} react-native`;
			Platform.isReactNative = true;
			break;
		default:
			Platform.userAgent = `aws-amplify/${version} js`;
			Platform.isReactNative = false;
			break;
	}
}

const appendUserAgentMiddleware = next => args => {
	const { request } = args;
	appendToUserAgent(request, Platform.userAgent);
	return next({
		...args,
		request,
	});
};

export const appendAmplifyUserAgent = client => {
	if (
		typeof client !== undefined &&
		client &&
		typeof client.middlewareStack !== undefined &&
		client.middlewareStack
	) {
		client.middlewareStack.add(appendUserAgentMiddleware, {
			step: 'build',
			priority: 0,
			tags: { CUSTOM_USER_AGENT: true },
		});
	}
};

/**
 * @deprecated use named import
 */
export default Platform;
