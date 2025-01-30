// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextServer } from '../types';

let isServerSideAuthEnabled = false;
let runtimeOptions: NextServer.CreateServerRunnerRuntimeOptions = {};
let isSSLOrigin = false;

export const globalSettings: NextServer.GlobalSettings = {
	enableServerSideAuth() {
		isServerSideAuthEnabled = true;
	},
	isServerSideAuthEnabled() {
		return isServerSideAuthEnabled;
	},
	setRuntimeOptions(options: NextServer.CreateServerRunnerRuntimeOptions) {
		runtimeOptions = options;
	},
	getRuntimeOptions() {
		return runtimeOptions;
	},
	setIsSSLOrigin(value: boolean) {
		isSSLOrigin = value;
	},
	isSSLOrigin() {
		return isSSLOrigin;
	},
};
