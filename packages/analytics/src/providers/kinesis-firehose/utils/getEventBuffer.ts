// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
	AWSCredentials, 
	haveCredentialsChanged 
} from '@aws-amplify/core/internals/utils';
import {
	FirehoseClient,
	PutRecordBatchCommand,
} from '@aws-sdk/client-firehose';
import { 
	EventBuffer, 
	groupBy, 
	IAnalyticsClient
} from '../../../utils';
import {
	KinesisFirehoseBufferEvent,
	KinesisFirehoseEventBufferConfig,
} from '../types';

/**
 * These Records hold cached event buffers and AWS clients.
 * The hash key is determined by the region and session,
 * consisting of a combined value comprising [region, sessionToken, identityId].
 *
 * Only one active session should exist at any given moment.
 * When a new session is initiated, the previous ones should be released.
 * */
const eventBufferMap: Record<
	string,
	EventBuffer<KinesisFirehoseBufferEvent>
> = {};
const cachedClients: Record<string, [FirehoseClient, AWSCredentials]> = {};

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
	userAgentValue,
}: KinesisFirehoseEventBufferConfig): EventBuffer<KinesisFirehoseBufferEvent> => {
	const sessionIdentityKey = [region, identityId].filter(id => !!id).join('-');
	const [ cachedClient, cachedCredentials ] = cachedClients[sessionIdentityKey] ?? [];
	let credentialsHaveChanged = false;

	// Check if credentials have changed for the cached client
	if (cachedClient) {
		credentialsHaveChanged = haveCredentialsChanged(cachedCredentials, credentials);
	}

	if (!eventBufferMap[sessionIdentityKey] || credentialsHaveChanged) {
		const getClient = (): IAnalyticsClient<KinesisFirehoseBufferEvent> => {
			if (!cachedClient || credentialsHaveChanged) {
				cachedClients[sessionIdentityKey] = [
					new FirehoseClient({
						region,
						credentials,
						customUserAgent: userAgentValue,
					}),
					credentials
				];
			}

			const [ firehoseClient ] = cachedClients[sessionIdentityKey];
			
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
			eventBufferMap[releaseSessionKey].flushAll().finally(() => {
				eventBufferMap[releaseSessionKey].release();
				delete eventBufferMap[releaseSessionKey];
				delete cachedClients[releaseSessionKey];
			});
		}
	}

	return eventBufferMap[sessionIdentityKey];
};
