/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { version } from './version';
import { Framework } from './constants';
import { detectFramework } from './detectFramework';

const BASE_USER_AGENT = `aws-amplify/${version}`;

let framework = detectFramework();
let frameworkHasBeenRerun = false;
export const Platform = {
	userAgent: BASE_USER_AGENT,
	framework,
	isReactNative: framework === Framework.ReactNative,
};

/**
 * Rerun framework detection once when getAmplifyUserAgent is called if framework is None.
 * ReactNative framework must be detected initially, however other frameworks may not be
 * detected in cases where DOM is not yet loaded.
 */
export const rerunFrameworkDetection = () => {
	if (Platform.framework === Framework.None && !frameworkHasBeenRerun) {
		framework = detectFramework();
		frameworkHasBeenRerun = true;
		Platform.framework = framework;
	}
};

export const getUserAgent = () => {
	return Platform.userAgent;
};

/**
 * @deprecated use named import
 */
export default Platform;
