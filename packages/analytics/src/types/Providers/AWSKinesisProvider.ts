// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface KinesisAnalyticsEvent {
	data: object | string;
	partitionKey: string;
	streamName: string;
	immediate?: boolean;
}
