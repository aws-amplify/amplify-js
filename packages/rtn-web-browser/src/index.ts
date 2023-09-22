// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { openAuthSessionAsync } from './apis/openAuthSessionAsync';
import { webBrowserNativeModule } from './apis/webBrowserNativeModule';

const mergedModule = {
	...webBrowserNativeModule,
	openAuthSessionAsync,
};

export { mergedModule as AmplifyRTNWebBrowser };
