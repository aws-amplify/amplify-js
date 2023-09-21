// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisEventData } from '@aws-amplify/core/src/providers/kinesis/types';

export type KinesisEvent = {
	streamName: string;
	partitionKey: string;
	data: KinesisEventData;
};

export type RecordInput = {
	event: KinesisEvent;
};
