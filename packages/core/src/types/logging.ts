// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Taken from @aws-sdk/client-cloudwatch-logs@3.6.1
 */
export interface InputLogEvent {
	timestamp: number | undefined;
	message: string | undefined;
}

export interface LoggingProvider {
	// return the name of you provider
	getProviderName(): string;

	// return the name of you category
	getCategoryName(): string;

	// configure the plugin
	configure(config?: object): object;

	// take logs and push to provider
	pushLogs(logs: InputLogEvent[]): void;
}
