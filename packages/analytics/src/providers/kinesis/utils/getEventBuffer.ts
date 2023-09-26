// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisBufferEvent, KinesisEventBufferConfig } from '../types';
import {
	EventBuffer,
	groupBy,
	IAnalyticsClient,
	recordToTupleList,
} from '../../../utils';
import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';

const eventBufferMap: Record<string, EventBuffer<KinesisBufferEvent>> = {};
const cachedClients: Record<string, KinesisClient> = {};

const createKinesisPutRecordsCommand = (
	streamName: string,
	events: KinesisBufferEvent[]
): PutRecordsCommand =>
	new PutRecordsCommand({
		StreamName: streamName,
		Records: events.map(x => ({
			PartitionKey: x.partitionKey,
			Data: x.event,
		})),
	});

const submitEvents = async (
	events: KinesisBufferEvent[],
	client: KinesisClient,
	resendLimit?: number
): Promise<KinesisBufferEvent[]> => {
	const groupedByStreamName = recordToTupleList(
		groupBy(x => x.streamName, events)
	);
	const requests = groupedByStreamName
		.map(x => createKinesisPutRecordsCommand(...x))
		.map(command => client.send(command));

	const responses = await Promise.allSettled(requests);
	const failedEvents = responses
		.map((x, i) => (x.status === 'rejected' ? groupedByStreamName[i][1] : []))
		.flat();
	return resendLimit
		? failedEvents
				.filter(x => x.retryCount >= resendLimit)
				.map(x => ({ ...x, retryCount: x.retryCount + 1 }))
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
}: KinesisEventBufferConfig): EventBuffer<KinesisBufferEvent> => {
	const { sessionToken } = credentials;
	const sessionIdentityKey = [region, sessionToken, identityId]
		.filter(x => !!x)
		.join('-');

	if (!eventBufferMap[sessionIdentityKey]) {
		const getKinesisClient = (): IAnalyticsClient<KinesisBufferEvent> => {
			if (!cachedClients[sessionIdentityKey]) {
				cachedClients[sessionIdentityKey] = new KinesisClient({
					credentials,
					region,
				});
			}

			return events => {
				return submitEvents(
					events,
					cachedClients[sessionIdentityKey],
					resendLimit
				);
			};
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
			eventBufferMap[releaseSessionKey].release();
			delete eventBufferMap[releaseSessionKey];
			delete cachedClients[releaseSessionKey];
		}
	}

	return eventBufferMap[sessionIdentityKey];
};
