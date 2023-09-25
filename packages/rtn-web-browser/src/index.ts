// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { openAuthSessionAsync } from './apis/openAuthSessionAsync';
import { nativeModule } from './nativeModule';

const mergedModule = {
	...nativeModule,
	openAuthSessionAsync,
};

export { mergedModule as AmplifyRTNWebBrowser };
