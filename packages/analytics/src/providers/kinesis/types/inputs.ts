// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisEventData } from '../../../types';

export type RecordInput = {
	streamName: string;
	partitionKey: string;
	data: KinesisEventData;
};
