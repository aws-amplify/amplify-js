// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Subscription } from 'rxjs';
import { AmplifyContext } from '@aws-amplify/core';
import {
	DocumentType,
	amplifyUuid,
	resolveCtxArgs,
} from '@aws-amplify/core/internals/utils';

import { AppSyncEventProvider as eventProvider } from '../../Providers/AWSAppSyncEventsProvider';

import { appsyncRequest } from './appsyncRequest';
import { configure, normalizeAuth, serializeEvents } from './utils';
import type {
	EventsChannel,
	EventsOptions,
	EventsSubscription,
	ProviderOptions,
	PublishResponse,
	PublishedEvent,
	SubscriptionObserver,
} from './types';

// Keeps a list of open channels in the websocket
const openChannels = new Set<string>();
async function connect(
	ctx: AmplifyContext,
	channel: string,
	options?: EventsOptions,
): Promise<EventsChannel>;

/**
 * @experimental API may change in future versions
 *
 * Establish a WebSocket connection to an Events channel
 *
 * @example
 * const channel = await events.connect("default/channel")
 *
 * channel.subscribe({
 *   next: (data) => { console.log(data) },
 *   error: (err) => { console.error(err) },
 * })
 *
 * @example // authMode override
 * const channel = await events.connect("default/channel", { authMode: "userPool" })
 *
 * @example // with explicit context
 * const channel = await events.connect(ctx, "default/channel")
 *
 * @param channel - channel path; `<namespace>/<channel>`
 * @param options - request overrides: `authMode`, `authToken`
 *
 */
async function connect(
	channel: string,
	options?: EventsOptions,
): Promise<EventsChannel>;
async function connect(...args: any[]): Promise<EventsChannel> {
	const [ctx, channel, options] =
		resolveCtxArgs<[string, EventsOptions?]>(args);

	const providerOptions: ProviderOptions = configure(ctx);

	providerOptions.authenticationType = normalizeAuth(
		options?.authMode,
		providerOptions.authenticationType,
	);
	providerOptions.apiKey = options?.apiKey || providerOptions.apiKey;
	providerOptions.authToken = options?.authToken || providerOptions.authToken;

	// Pass ctx to the provider so WebSocket auth uses the correct credentials
	await eventProvider.connect({ ...providerOptions, ctx });

	const channelId = amplifyUuid();
	openChannels.add(channelId);

	let _subscription: Subscription;

	const sub = (
		observer: SubscriptionObserver<any>,
		subOptions?: EventsOptions,
	): EventsSubscription => {
		if (!openChannels.has(channelId)) {
			throw new Error('Channel is closed');
		}
		const subscribeOptions = { ...providerOptions, query: channel };
		subscribeOptions.authenticationType = normalizeAuth(
			subOptions?.authMode,
			subscribeOptions.authenticationType,
		);
		subscribeOptions.apiKey = subOptions?.apiKey || subscribeOptions.apiKey;
		subscribeOptions.authToken =
			subOptions?.authToken || subscribeOptions.authToken;

		// One-shot readiness signal for THIS subscribe call. Locals (not the
		// closure-scoped `_subscription`) so concurrent subscribes don't collide.
		let settled = false;
		let resolveReady!: (value: { subscriptionId: string }) => void;
		let rejectReady!: (reason?: unknown) => void;
		const ready = new Promise<{ subscriptionId: string }>((resolve, reject) => {
			resolveReady = resolve;
			rejectReady = reject;
		});
		// Avoid unhandled-rejection noise before the caller reads `.ready`.
		ready.catch(() => undefined);

		_subscription = eventProvider
			.subscribe({
				...subscribeOptions,
				ctx,
				onSubscriptionReady: (subscriptionId: string) => {
					if (!settled) {
						settled = true;
						resolveReady({ subscriptionId });
					}
				},
				onSubscriptionError: (_subscriptionId: string, error?: unknown) => {
					if (!settled) {
						settled = true;
						rejectReady(error);
					}
				},
			})
			.subscribe(observer);

		// Reject `ready` if the caller unsubscribes (or the channel closes, which
		// calls unsubscribe) before the server ACKs the subscription.
		const originalUnsubscribe = _subscription.unsubscribe.bind(_subscription);
		_subscription.unsubscribe = () => {
			if (!settled) {
				settled = true;
				rejectReady(new Error('Subscription unsubscribed before ready'));
			}
			originalUnsubscribe();
		};

		// Augment the returned rxjs Subscription with the readiness promise
		// (backward compatible: existing callers keep the Subscription contract).
		const eventsSubscription: EventsSubscription = Object.assign(
			_subscription,
			{
				ready,
			},
		);

		return eventsSubscription;
	};

	const pub = async (
		event: DocumentType,
		pubOptions?: EventsOptions,
	): Promise<any> => {
		if (!openChannels.has(channelId)) {
			throw new Error('Channel is closed');
		}
		const publishOptions = {
			...providerOptions,
			query: channel,
			variables: event,
		};
		publishOptions.authenticationType = normalizeAuth(
			pubOptions?.authMode,
			publishOptions.authenticationType,
		);
		publishOptions.apiKey = pubOptions?.apiKey || publishOptions.apiKey;
		publishOptions.authToken =
			pubOptions?.authToken || publishOptions.authToken;

		return eventProvider.publish({ ...publishOptions, ctx });
	};

	const close = async () => {
		_subscription && _subscription.unsubscribe();
		openChannels.delete(channelId);
		setTimeout(() => {
			if (openChannels.size === 0) {
				eventProvider.closeIfNoActiveSubscription();
			}
		}, 1000);
	};

	return {
		subscribe: sub,
		close,
		publish: pub,
	};
}
async function post(
	ctx: AmplifyContext,
	channel: string,
	event: DocumentType | DocumentType[],
	options?: EventsOptions,
): Promise<void | PublishedEvent[]>;

/**
 * @experimental API may change in future versions
 *
 * Publish events to a channel via HTTP request
 *
 * @example
 * await events.post("default/channel", { some: "event" })
 *
 * @example // event batching
 * await events.post("default/channel", [{ some: "event" }, { some: "event2" }])
 *
 * @example // authMode override
 * await events.post("default/channel", { some: "event" }, { authMode: "userPool" })
 *
 * @example // with explicit context
 * await events.post(ctx, "default/channel", { some: "event" })
 *
 * @param channel - channel path; `<namespace>/<channel>`
 * @param event - JSON-serializable value or an array of values
 * @param options - request overrides: `authMode`, `authToken`
 *
 * @returns void on success
 * @throws on error
 */
async function post(
	channel: string,
	event: DocumentType | DocumentType[],
	options?: EventsOptions,
): Promise<void | PublishedEvent[]>;
async function post(...args: any[]): Promise<void | PublishedEvent[]> {
	const [ctx, channel, event, options] =
		resolveCtxArgs<[string, DocumentType | DocumentType[], EventsOptions?]>(
			args,
		);

	const providerOptions: ProviderOptions = configure(ctx);
	providerOptions.authenticationType = normalizeAuth(
		options?.authMode,
		providerOptions.authenticationType,
	);
	providerOptions.apiKey = options?.apiKey || providerOptions.apiKey;
	providerOptions.authToken = options?.authToken || providerOptions.authToken;

	// trailing slash required in publish
	const normalizedChannelName = channel[0] === '/' ? channel : `/${channel}`;

	const publishOptions = {
		...providerOptions,
		query: normalizedChannelName,
		variables: serializeEvents(event),
	};

	const abortController = new AbortController();

	const res = await appsyncRequest<PublishResponse>(
		ctx,
		publishOptions,
		{},
		abortController,
	);

	if (res.failed?.length > 0) {
		return res.failed;
	}
}

/**
 * @experimental API may change in future versions
 *
 * Close WebSocket connection, disconnect listeners and reconnect observers
 *
 * @example
 * await events.closeAll()
 *
 * @returns void on success
 * @throws on error
 */
async function closeAll(): Promise<void> {
	await eventProvider.close();
}

export { connect, post, closeAll };
