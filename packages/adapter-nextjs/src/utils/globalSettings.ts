// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextServer } from '../types';

let isServerSideAuthEnabled = false;
let runtimeOptions: NextServer.CreateServerRunnerRuntimeOptions = {};
let isSSLOrigin = false;

export const globalSettings: NextServer.GlobalSettings = {
	isServerSideAuthEnabled() {
		return isServerSideAuthEnabled;
	},
	enableServerSideAuth() {
		isServerSideAuthEnabled = true;
	},
	setRuntimeOptions(options: NextServer.CreateServerRunnerRuntimeOptions) {
		runtimeOptions = options;
	},
	getRuntimeOptions() {
		return runtimeOptions;
	},
	isSSLOrigin() {
		return isSSLOrigin;
	},
	setIsSSLOrigin(value: boolean) {
		isSSLOrigin = value;
	},
};
