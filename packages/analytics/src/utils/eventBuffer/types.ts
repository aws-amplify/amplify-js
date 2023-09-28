// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface IAnalyticsClient<T> {
	(events: T[]): Promise<T[]>;
}

export type EventBufferConfig = {
	flushSize: number;
	flushInterval: number;
	bufferSize: number;
};
