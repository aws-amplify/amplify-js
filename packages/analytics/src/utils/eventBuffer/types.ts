// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type IAnalyticsClient<T> = (events: T[]) => Promise<T[]>;

export interface EventBufferConfig {
	flushSize: number;
	flushInterval: number;
	bufferSize: number;
}
