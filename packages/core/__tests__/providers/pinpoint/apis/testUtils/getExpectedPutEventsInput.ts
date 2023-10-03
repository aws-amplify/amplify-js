// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	appId,
	endpointId as defaultEndpointId,
	uuid,
	event as defaultEvent,
} from '../../testUtils/data';

export const getExpectedPutEventsInput = ({
	endpointId = defaultEndpointId,
	event = defaultEvent,
	eventId = uuid,
	sessionId = uuid,
}: any) =>
	expect.objectContaining({
		ApplicationId: appId,
		EventsRequest: {
			BatchItem: {
				[endpointId]: {
					Endpoint: {},
					Events: {
						[eventId]: {
							EventType: event.name,
							Timestamp: expect.any(String),
							Attributes: event.attributes,
							Metrics: event.metrics,
							Session: {
								Id: sessionId,
								StartTimestamp: expect.any(String),
							},
						},
					},
				},
			},
		},
	});
