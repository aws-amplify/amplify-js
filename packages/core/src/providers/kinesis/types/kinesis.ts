// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type KinesisStream = {
	region: string;
	streamName: string;
};

export type KinesisShard = KinesisStream & {
	partitionKey: string;
};

export type KinesisEventData = Record<string, unknown> | Uint8Array;

export type KinesisProviderConfig = {
	Kinesis: {
		region: string;
		bufferSize?: number;
		flushSize?: number;
		flushInterval?: number;
		resendLimit?: number;
	};
};
