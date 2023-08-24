// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules } from 'react-native';
import { WebBrowserNativeModule } from './types';
import { openAuthSessionAsync } from './apis/openAuthSessionAsync';

const module: WebBrowserNativeModule = NativeModules.AmplifyRTNWebBrowser;

const mergedModule = {
	...module,
	openAuthSessionAsync,
};

export { mergedModule as AmplifyRTNWebBrowser };
