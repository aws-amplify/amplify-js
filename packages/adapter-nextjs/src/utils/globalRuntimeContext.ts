// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextServer } from '../types/';

const globalRuntimeContextStore: NextServer.GlobalRuntimeContextStore = {
	isServerSideAuthEnabled: false,
	runtimeOptions: {},
	isSSLOrigin: false,
};

export const globalRuntimeContext: NextServer.GlobalRuntimeContext = {
	isServerSideAuthEnabled() {
		return globalRuntimeContextStore.isServerSideAuthEnabled;
	},
	enableServerSideAuth() {
		console.log('enableServerSideAuth', 'Enabling server side auth');
		globalRuntimeContextStore.isServerSideAuthEnabled = true;
	},
	setRuntimeOptions(options: NextServer.CreateServerRunnerRuntimeOptions) {
		globalRuntimeContextStore.runtimeOptions = options;
	},
	getRuntimeOptions() {
		return globalRuntimeContextStore.runtimeOptions;
	},
	isSSLOrigin() {
		return globalRuntimeContextStore.isSSLOrigin;
	},
	setIsSSLOrigin(isSSLOrigin: boolean) {
		globalRuntimeContextStore.isSSLOrigin = isSSLOrigin;
	},
};
