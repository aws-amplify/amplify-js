// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisBufferEvent, KinesisEventBufferConfig } from '../types';
import { EventBuffer, groupBy, IAnalyticsClient } from '../../../utils';
import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';

/**
 * These Records hold cached event buffers and AWS clients.
 * The hash key is determined by the region and session,
 * consisting of a combined value comprising [region, sessionToken, identityId].
 *
 * Only one active session should exist at any given moment.
 * When a new session is initiated, the previous ones should be released.
 * */
const eventBufferMap: Record<string, EventBuffer<KinesisBufferEvent>> = {};
const cachedClients: Record<string, KinesisClient> = {};

const createKinesisPutRecordsCommand = (
	streamName: string,
	events: KinesisBufferEvent[]
): PutRecordsCommand =>
	new PutRecordsCommand({
		StreamName: streamName,
		Records: events.map(event => ({
			PartitionKey: event.partitionKey,
			Data: event.event,
		})),
	});

const submitEvents = async (
	events: KinesisBufferEvent[],
	client: KinesisClient,
	resendLimit?: number
): Promise<KinesisBufferEvent[]> => {
	const groupedByStreamName = Object.entries(
		groupBy(event => event.streamName, events)
	);
	const requests = groupedByStreamName
		.map(([streamName, events]) =>
			createKinesisPutRecordsCommand(streamName, events)
		)
		.map(command => client.send(command));

	const responses = await Promise.allSettled(requests);
	const failedEvents = responses
		.map((response, i) =>
			response.status === 'rejected' ? groupedByStreamName[i][1] : []
		)
		.flat();
	return resendLimit
		? failedEvents
				.filter(event => event.retryCount < resendLimit)
				.map(event => ({ ...event, retryCount: event.retryCount + 1 }))
				.sort((a, b) => a.timestamp - b.timestamp)
		: [];
};

export const getEventBuffer = ({
	region,
	flushInterval,
	flushSize,
	bufferSize,
	credentials,
	identityId,
	resendLimit,
	userAgentValue,
}: KinesisEventBufferConfig): EventBuffer<KinesisBufferEvent> => {
	const sessionIdentityKey = [region, identityId].filter(x => !!x).join('-');

	if (!eventBufferMap[sessionIdentityKey]) {
		const getKinesisClient = (): IAnalyticsClient<KinesisBufferEvent> => {
			if (!cachedClients[sessionIdentityKey]) {
				cachedClients[sessionIdentityKey] = new KinesisClient({
					credentials,
					region,
					customUserAgent: userAgentValue,
				});
			}

			return events =>
				submitEvents(events, cachedClients[sessionIdentityKey], resendLimit);
		};

		// create new session
		eventBufferMap[sessionIdentityKey] = new EventBuffer<KinesisBufferEvent>(
			{
				flushInterval,
				flushSize,
				bufferSize,
			},
			getKinesisClient
		);

		// release other sessions
		const releaseSessionKeys = Object.keys(eventBufferMap).filter(
			x => x !== sessionIdentityKey
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
