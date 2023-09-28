// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBuffer, groupBy, IAnalyticsClient } from '../../../utils';
import {
	FirehoseClient,
	PutRecordBatchCommand,
} from '@aws-sdk/client-firehose';
import {
	KinesisFirehoseBufferEvent,
	KinesisFirehoseEventBufferConfig,
} from '../types';

const eventBufferMap: Record<
	string,
	EventBuffer<KinesisFirehoseBufferEvent>
> = {};
const cachedClients: Record<string, FirehoseClient> = {};

const createPutRecordsBatchCommand = (
	streamName: string,
	events: KinesisFirehoseBufferEvent[]
): PutRecordBatchCommand =>
	new PutRecordBatchCommand({
		DeliveryStreamName: streamName,
		Records: events.map(event => ({
			Data: event.event,
		})),
	});

const submitEvents = async (
	events: KinesisFirehoseBufferEvent[],
	client: FirehoseClient,
	resendLimit?: number
): Promise<KinesisFirehoseBufferEvent[]> => {
	const groupedByStreamName = Object.entries(
		groupBy(event => event.streamName, events)
	);

	const requests = groupedByStreamName
		.map(([streamName, events]) =>
			createPutRecordsBatchCommand(streamName, events)
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
	credentials,
	identityId,
	bufferSize,
	flushSize,
	flushInterval,
	resendLimit,
}: KinesisFirehoseEventBufferConfig): EventBuffer<KinesisFirehoseBufferEvent> => {
	const { sessionToken } = credentials;
	const sessionIdentityKey = [region, sessionToken, identityId]
		.filter(id => !!id)
		.join('-');

	if (!eventBufferMap[sessionIdentityKey]) {
		const getClient = (): IAnalyticsClient<KinesisFirehoseBufferEvent> => {
			if (!cachedClients[sessionIdentityKey]) {
				cachedClients[sessionIdentityKey] = new FirehoseClient({
					region,
					credentials,
				});
			}

			const firehoseClient = cachedClients[sessionIdentityKey];
			return events => submitEvents(events, firehoseClient, resendLimit);
		};

		eventBufferMap[sessionIdentityKey] =
			new EventBuffer<KinesisFirehoseBufferEvent>(
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
			eventBufferMap[releaseSessionKey].release();
			delete eventBufferMap[releaseSessionKey];
			delete cachedClients[releaseSessionKey];
		}
	}

	return eventBufferMap[sessionIdentityKey];
};
