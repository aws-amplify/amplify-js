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

		// One-shot readiness signal for THIS subscribe call. The promise state
		// (`settled`/`resolveReady`/`rejectReady`) is kept in locals so the
		// resolve/reject callbacks below close over this specific subscribe call.
		// NOTE: the channel-level `_subscription` closure var is overwritten on
		// each subscribe, so `close()` only rejects the MOST RECENT subscription's
		// `ready`; rejecting `ready` for earlier concurrent subscriptions on the
		// same channel is a pre-existing limitation (not addressed here).
		let settled = false;
		let resolveReady!: (value: { subscriptionId: string }) => void;
		let rejectReady!: (reason?: unknown) => void;
		const ready = new Promise<{ subscriptionId: string }>((resolve, reject) => {
			resolveReady = resolve;
			rejectReady = reject;
		});
		// Avoid unhandled-rejection noise before the caller reads `.ready`.
		ready.catch(() => undefined);

		const providerSubscription = eventProvider
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
						// `error` is optional on the provider callback; default it so
						// `ready` never rejects with `undefined`.
						rejectReady(error ?? new Error('Subscription failed before ready'));
					}
				},
			})
			.subscribe(observer);

		// Expose the readiness promise on a DELEGATING wrapper instead of mutating
		// the rxjs Subscriber returned above. rxjs calls `this.unsubscribe()`
		// internally from Subscriber.error()/complete(); if we patched the
		// subscriber's own `unsubscribe`, a provider-driven error would fire it and
		// reject `ready` with a generic reason, masking the real error. Delegating
		// through a prototype wrapper keeps rxjs's internal `this.unsubscribe()`
		// hitting the ORIGINAL subscriber, so only a CALLER-initiated unsubscribe
		// (via this returned object) or a channel close rejects `ready`. The
		// provider-side onSubscriptionError is the PRIMARY reject signal; this is
		// the fallback for a genuine caller unsubscribe / close-before-ack. rxjs
		// Subscription methods/props (`closed`, `add`, etc.) resolve through the
		// prototype, so the returned object still satisfies the Subscription
		// contract (backward compatible for existing callers).
		const eventsSubscription: EventsSubscription =
			Object.create(providerSubscription);
		Object.defineProperty(eventsSubscription, 'unsubscribe', {
			value: () => {
				if (!settled) {
					settled = true;
					rejectReady(new Error('Subscription closed before ready'));
				}
				providerSubscription.unsubscribe();
			},
			writable: true,
			enumerable: false,
			configurable: true,
		});
		Object.defineProperty(eventsSubscription, 'ready', {
			value: ready,
			writable: false,
			enumerable: true,
			configurable: true,
		});

		// `close()` unsubscribes the most recent subscription through this closure
		// var (the delegate above), which rejects its `ready` if still pending.
		_subscription = eventsSubscription;

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
