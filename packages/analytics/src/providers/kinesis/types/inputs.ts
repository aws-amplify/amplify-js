// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisEventData } from '../../../types';
import {
	EventTrackingOptions,
	PageViewTrackingOptions,
	SessionTrackingOptions,
} from '../../../types/trackers';

export interface RecordInput {
	streamName: string;
	partitionKey: string;
	data: KinesisEventData;
}

/**
 * Session tracking options for Kinesis auto-tracking. Extends the generic session tracking options with the
 * Kinesis stream coordinates that automatically tracked events will be sent to.
 */
export interface KinesisSessionTrackingOptions extends SessionTrackingOptions {
	streamName: string;
	partitionKey: string;
}

/**
 * Page view tracking options for Kinesis auto-tracking. Extends the generic page view tracking options with the
 * Kinesis stream coordinates that automatically tracked events will be sent to.
 */
export interface KinesisPageViewTrackingOptions
	extends PageViewTrackingOptions {
	streamName: string;
	partitionKey: string;
}

/**
 * Event tracking options for Kinesis auto-tracking. Extends the generic event tracking options with the
 * Kinesis stream coordinates that automatically tracked events will be sent to.
 */
export interface KinesisEventTrackingOptions extends EventTrackingOptions {
	streamName: string;
	partitionKey: string;
}

/**
 * Input type for Kinesis configureAutoTrack API.
 */
export type KinesisConfigureAutoTrackInput = {
	enable: boolean;
} & (
	| {
			type: 'session';
			options?: KinesisSessionTrackingOptions;
	  }
	| {
			type: 'pageView';
			options?: KinesisPageViewTrackingOptions;
	  }
	| {
			type: 'event';
			options?: KinesisEventTrackingOptions;
	  }
);
