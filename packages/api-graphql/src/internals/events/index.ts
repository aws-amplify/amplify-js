// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Subscription } from 'rxjs';
import { Amplify } from '@aws-amplify/core';
import { DocumentType } from '@aws-amplify/core/internals/utils';

import { AWSAppSyncEventProvider } from '../../Providers/AWSAppSyncEventsProvider';

import { appsyncRequest } from './appsyncRequest';
import { configure, normalizeAuth } from './utils';
import type {
	EventsChannel,
	EventsOptions,
	PublishResponse,
	PublishedEvent,
	SubscriptionObserver,
} from './types';

const eventProvider = new AWSAppSyncEventProvider();

/**
 *
 * @param channelName
 * @param options
 */
async function connect(
	channelName: string,
	options?: EventsOptions,
): Promise<EventsChannel> {
	const providerOptions = configure();

	providerOptions.authenticationType = normalizeAuth(
		options?.authMode,
		providerOptions.authenticationType,
	);

	await eventProvider.connect(providerOptions);

	let _subscription: Subscription;

	const sub = (
		observer: SubscriptionObserver<any>,
		subOptions?: EventsOptions,
	): Subscription => {
		const subscribeOptions = { ...providerOptions, query: channelName };
		subscribeOptions.authenticationType = normalizeAuth(
			subOptions?.authMode,
			subscribeOptions.authenticationType,
		);

		_subscription = eventProvider
			.subscribe(subscribeOptions)
			.subscribe(observer);

		return _subscription;
	};

	// WS publish is not enabled in the service yet. It will be a follow up feature
	const _pub = async (
		event: DocumentType,
		pubOptions?: EventsOptions,
	): Promise<any> => {
		const publishOptions = {
			...providerOptions,
			query: channelName,
			variables: event,
		};
		publishOptions.authenticationType = normalizeAuth(
			pubOptions?.authMode,
			publishOptions.authenticationType,
		);

		return eventProvider.publish(publishOptions);
	};

	const close = () => {
		_subscription && _subscription.unsubscribe();
	};

	return {
		// WS publish is not enabled in the service yet, will be a follow up feature
		// publish: pub,
		subscribe: sub,
		close,
	};
}

/**
 * Event API expects and array of JSON strings
 *
 * @param events - JSON-serializable value or an array of values
 * @returns array of JSON strings
 */
const serializeEvents = (events: DocumentType | DocumentType[]): string[] => {
	if (Array.isArray(events)) {
		return events.map((ev, idx) => {
			const eventJson = JSON.stringify(ev);
			if (eventJson === undefined) {
				throw new Error(
					`Event must be a valid JSON value. Received ${ev} at index ${idx}`,
				);
			}

			return eventJson;
		});
	}

	const eventJson = JSON.stringify(events);
	if (eventJson === undefined) {
		throw new Error(`Event must be a valid JSON value. Received ${events}`);
	}

	return [eventJson];
};

/**
 *
 * @param channelName - publish destination
 * @param event - JSON-serializable value or an array of values
 * @param options
 */
async function post(
	channelName: string,
	event: DocumentType | DocumentType[],
	options?: EventsOptions,
): Promise<void | PublishedEvent[]> {
	const providerOptions = configure();
	providerOptions.authenticationType = normalizeAuth(
		options?.authMode,
		providerOptions.authenticationType,
	);

	// trailing slash required in publish
	const normalizedChannelName =
		channelName[0] === '/' ? channelName : `/${channelName}`;

	const publishOptions = {
		...providerOptions,
		query: normalizedChannelName,
		variables: serializeEvents(event),
		authToken: options?.authToken,
	};

	const abortController = new AbortController();

	const res = await appsyncRequest<PublishResponse>(
		Amplify,
		publishOptions,
		{},
		abortController,
	);

	if (res.failed?.length > 0) {
		return res.failed;
	}
}

function closeAll(): void {
	eventProvider.close();
}

export { connect, post, closeAll };
