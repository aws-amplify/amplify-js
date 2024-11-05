// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisEventData } from '../../../types';

export interface RecordInput {
	streamName: string;
	data: KinesisEventData;
}
