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
	data: KinesisEventData;
}

/**
 * Session tracking options for Kinesis Data Firehose auto-tracking. Extends the generic session tracking options
 * with the Firehose delivery stream that automatically tracked events will be sent to.
 */
export interface KinesisFirehoseSessionTrackingOptions
	extends SessionTrackingOptions {
	streamName: string;
}

/**
 * Page view tracking options for Kinesis Data Firehose auto-tracking. Extends the generic page view tracking
 * options with the Firehose delivery stream that automatically tracked events will be sent to.
 */
export interface KinesisFirehosePageViewTrackingOptions
	extends PageViewTrackingOptions {
	streamName: string;
}

/**
 * Event tracking options for Kinesis Data Firehose auto-tracking. Extends the generic event tracking options with
 * the Firehose delivery stream that automatically tracked events will be sent to.
 */
export interface KinesisFirehoseEventTrackingOptions
	extends EventTrackingOptions {
	streamName: string;
}

/**
 * Input type for Kinesis Data Firehose configureAutoTrack API.
 */
export type KinesisFirehoseConfigureAutoTrackInput = {
	enable: boolean;
} & (
	| {
			type: 'session';
			options?: KinesisFirehoseSessionTrackingOptions;
	  }
	| {
			type: 'pageView';
			options?: KinesisFirehosePageViewTrackingOptions;
	  }
	| {
			type: 'event';
			options?: KinesisFirehoseEventTrackingOptions;
	  }
);
