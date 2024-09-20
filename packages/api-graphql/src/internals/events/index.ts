// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Observable } from 'rxjs';
import { Amplify } from '@aws-amplify/core';
import {
	DocumentType,
	GraphQLAuthMode,
} from '@aws-amplify/core/internals/utils';

import { AWSAppSyncEventProvider } from '../../Providers/AWSAppSyncEventsProvider';

import { appsyncRequest } from './appsyncRequest';

type ResolvedGraphQLAuthModes = Exclude<GraphQLAuthMode, 'identityPool'>;
interface EventsOptions {
	authMode?: GraphQLAuthMode;
	authToken?: string;
}

const eventProvider = new AWSAppSyncEventProvider();

const normalizeAuth = (
	explicitAuthMode: GraphQLAuthMode | undefined,
	defaultAuthMode: ResolvedGraphQLAuthModes,
): ResolvedGraphQLAuthModes => {
	if (!explicitAuthMode) {
		return defaultAuthMode;
	}

	if (explicitAuthMode === 'identityPool') {
		return 'iam';
	}

	return explicitAuthMode;
};

const configure = () => {
	const config = Amplify.getConfig() as any;

	// TODO - get this correct
	const eventsConfig = config.API?.GraphQL?.events ?? config.data?.events;

	if (!eventsConfig) {
		throw new Error(
			'Amplify configuration is missing. Have you called Amplify.configure()',
		);
	}

	const configAuthMode = normalizeAuth(
		eventsConfig.defaultAuthMode ?? eventsConfig.default_authorization_type,
		'apiKey',
	);

	const options = {
		appSyncGraphqlEndpoint: eventsConfig.url,
		region: eventsConfig.region ?? eventsConfig.aws_region,
		authenticationType: configAuthMode,
		apiKey: eventsConfig.apiKey ?? eventsConfig.api_key,
	};

	return options;
};

interface SubscriptionObserver<T> {
	next(value: T): void;
	error(errorValue: any): void;
}

/**
 *
 * @param channelName
 * @param options
 */
async function connect(channelName: string, options?: EventsOptions) {
	const providerOptions = configure();

	providerOptions.authenticationType = normalizeAuth(
		options?.authMode,
		providerOptions.authenticationType,
	);

	await eventProvider.connect(providerOptions);

	const sub = (
		observer: SubscriptionObserver<any>,
		subOptions?: EventsOptions,
	): Observable<any> => {
		const subscribeOptions = { ...providerOptions, query: channelName };
		subscribeOptions.authenticationType = normalizeAuth(
			subOptions?.authMode,
			subscribeOptions.authenticationType,
		);

		const _sub = eventProvider.subscribe(subscribeOptions);
		_sub.subscribe(observer);

		return _sub;
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

	return {
		// WS publish is not enabled in the service yet, will be a follow up feature
		// publish: pub,
		subscribe: sub,
	};
}

interface PublishedEvent {
	identifier: string;
	index: number;
}
interface PublishResponse {
	failed: PublishedEvent[];
	successful: PublishedEvent[];
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
