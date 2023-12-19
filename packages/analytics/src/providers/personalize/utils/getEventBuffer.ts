// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBuffer, groupBy, IAnalyticsClient } from '../../../utils';
import { PersonalizeBufferConfig, PersonalizeBufferEvent } from '../types';
import {
	PersonalizeEventsClient,
	PutEventsCommand,
} from '@aws-sdk/client-personalize-events';

/**
 * These Records hold cached event buffers and AWS clients.
 * The hash key is determined by the region and session,
 * consisting of a combined value comprising [region, sessionToken, identityId].
 *
 * Only one active session should exist at any given moment.
 * When a new session is initiated, the previous ones should be released.
 * */
const eventBufferMap: Record<string, EventBuffer<PersonalizeBufferEvent>> = {};
const cachedClients: Record<string, PersonalizeEventsClient> = {};

const DELIMITER = '#';

const createPutEventsCommand = (
	ids: string,
	events: PersonalizeBufferEvent[]
): PutEventsCommand => {
	const [trackingId, sessionId, userId] = ids.split(DELIMITER);
	return new PutEventsCommand({
		trackingId,
		sessionId,
		userId,
		eventList: events.map(event => ({
			eventId: event.event.eventId,
			eventType: event.event.eventType,
			properties: JSON.stringify(event.event.properties),
			sentAt: new Date(event.timestamp),
		})),
	});
};

const submitEvents = async (
	events: PersonalizeBufferEvent[],
	client: PersonalizeEventsClient
): Promise<PersonalizeBufferEvent[]> => {
	const groupedByIds = Object.entries(
		groupBy(
			event =>
				[event.trackingId, event.sessionId, event.userId]
					.filter(id => !!id)
					.join(DELIMITER),
			events
		)
	);

	const requests = groupedByIds
		.map(([ids, events]) => createPutEventsCommand(ids, events))
		.map(command => client.send(command));

	await Promise.allSettled(requests);
	return Promise.resolve([]);
};

export const getEventBuffer = ({
	region,
	flushSize,
	flushInterval,
	bufferSize,
	credentials,
	identityId,
	userAgentValue,
}: PersonalizeBufferConfig): EventBuffer<PersonalizeBufferEvent> => {
	const sessionIdentityKey = [region, identityId].filter(x => !!x).join('-');

	if (!eventBufferMap[sessionIdentityKey]) {
		const getClient = (): IAnalyticsClient<PersonalizeBufferEvent> => {
			if (!cachedClients[sessionIdentityKey]) {
				cachedClients[sessionIdentityKey] = new PersonalizeEventsClient({
					region,
					credentials,
					customUserAgent: userAgentValue,
				});
			}
			return events => submitEvents(events, cachedClients[sessionIdentityKey]);
		};

		eventBufferMap[sessionIdentityKey] =
			new EventBuffer<PersonalizeBufferEvent>(
				{
					bufferSize,
					flushSize,
					flushInterval,
				},
				getClient
			);

		const releaseSessionKeys = Object.keys(eventBufferMap).filter(
			key => key !== sessionIdentityKey
		);
		for (const releaseSessionKey of releaseSessionKeys) {
			eventBufferMap[releaseSessionKey].flushAll().finally(() => {
				eventBufferMap[releaseSessionKey].release();
				delete eventBufferMap[releaseSessionKey];
				delete cachedClients[releaseSessionKey];
			});
		}
	}

	return eventBufferMap[sessionIdentityKey];
};
