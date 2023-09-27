// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum AWSPinpointMessageEventSource {
	CAMPAIGN = '_campaign',
	JOURNEY = '_journey',
}

export enum AWSPinpointMessageEvent {
	NOTIFICATION_OPENED = 'opened_notification',
	BACKGROUND_MESSAGE_RECEIVED = 'received_background',
	FOREGROUND_MESSAGE_RECEIVED = 'received_foreground',
}
