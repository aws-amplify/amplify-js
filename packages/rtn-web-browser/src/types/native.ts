// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModule } from 'react-native';

export interface WebBrowserNativeModule extends NativeModule {
	openAuthSessionAsync: (
		url: string,
		redirectUrl?: string,
		prefersEphemeralSession?: boolean,
	) => Promise<string | null>;
}
