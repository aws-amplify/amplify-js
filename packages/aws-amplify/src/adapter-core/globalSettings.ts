// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface GlobalSettings {
	isServerSideAuthEnabled(): boolean;
	enableServerSideAuth(): void;
	setRuntimeOptions(runtimeOptions: unknown): void;
	getRuntimeOptions(): Record<string, any>;
	setIsSSLOrigin(isSSLOrigin: boolean): void;
	isSSLOrigin(): boolean;
}

export function createGlobalSettings(): GlobalSettings {
	let serverSideAuthEnabled = false;
	let runtimeOptions: Record<string, any> = {};
	let sslOrigin = false;

	return {
		enableServerSideAuth() {
			serverSideAuthEnabled = true;
		},
		isServerSideAuthEnabled() {
			return serverSideAuthEnabled;
		},
		setRuntimeOptions(options: unknown) {
			runtimeOptions = structuredClone(options as Record<string, any>);
		},
		getRuntimeOptions() {
			return runtimeOptions;
		},
		setIsSSLOrigin(value: boolean) {
			sslOrigin = value;
		},
		isSSLOrigin() {
			return sslOrigin;
		},
	};
}
