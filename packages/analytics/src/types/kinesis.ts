// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface KinesisStream {
	region: string;
	streamName: string;
}

export type KinesisShard = KinesisStream & {
	partitionKey: string;
};

export type KinesisEventData = Record<string, unknown> | Uint8Array;
