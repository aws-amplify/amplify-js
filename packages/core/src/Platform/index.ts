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
const packageInfo = require('../../package.json');

const Platform = {
	userAgent: `aws-amplify/${packageInfo.version} js`,
	product: '',
	navigator: null,
	isReactNative: false,
};
if (typeof navigator !== 'undefined' && navigator.product) {
	Platform.product = navigator.product || '';
	Platform.navigator = navigator || null;
	switch (navigator.product) {
		case 'ReactNative':
			Platform.userAgent = `aws-amplify/${packageInfo.version} react-native`;
			Platform.isReactNative = true;
			break;
		default:
			Platform.userAgent = `aws-amplify/${packageInfo.version} js`;
			Platform.isReactNative = false;
			break;
	}
}
export default Platform;
