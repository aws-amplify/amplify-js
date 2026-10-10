// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Subscription } from 'rxjs';
import type {
	DocumentType,
	GraphQLAuthMode,
} from '@aws-amplify/core/internals/utils';

export interface SubscriptionObserver<T> {
	next(value: T): void;
	error(errorValue: any): void;
}

/**
 * @experimental API may change in future versions
 *
 * An rxjs `Subscription` augmented with a one-shot `ready` promise that
 * resolves once the AppSync server ACKs the subscription.
 */
export interface EventsSubscription extends Subscription {
	/**
	 * @experimental API may change in future versions
	 *
	 * Resolves with the AppSync subscription id once the server ACKs the
	 * subscription. Rejects on subscribe error, start-ack timeout, or
	 * unsubscribe/close-before-ack. One-shot: reconnects do not re-settle it.
	 *
	 * Note: `ready` has NO built-in timeout — it stays pending until the server
	 * ACKs or the subscription errors/closes. Callers that need a bound should
	 * race their own timeout, e.g. `Promise.race([sub.ready, timeout])`.
	 */
	readonly ready: Promise<{ subscriptionId: string }>;
}

export interface EventsChannel {
	/**
	 * @experimental API may change in future versions
	 *
	 * Subscribe to Events
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
	 * channel.subscribe({
	 *   next: (data) => { console.log(data) },
	 *   error: (err) => { console.error(err) },
	 * }, { authMode: 'userPool' })
	 *
	 * @param observer - observer callback handlers
	 * `{ next: () => {}, error: () => {}}`
	 *
	 * @param options - subscribe overrides: `authMode`, `authToken`
	 *
	 */
	subscribe(
		observer: SubscriptionObserver<any>,
		subOptions?: EventsOptions,
	): EventsSubscription;
	/**
	 * @experimental API may change in future versions
	 *
	 * Publish events to a channel via WebSocket
	 *
	 * @example
	 * const channel = await events.connect("default/channel")
	 *
	 * await channel.publish({ some: "data" });
	 *
	 * @example // event batching
	 * await channel.publish("default/channel", [{ some: "event" }, { some: "event2" }])
	 *
	 * @example // authMode override
	 * await channel.publish({ some: "data" }, { authMode: "userPool" });
	 *
	 * @param event - JSON-serializable value or an array of values
	 * @param pubOptions - request overrides: `authMode`, `authToken`
	 *
	 * @returns void on success
	 * @throws on error
	 */
	publish(event: DocumentType, pubOptions?: EventsOptions): Promise<any>;
	/**
	 * @experimental API may change in future versions
	 *
	 * Close channel and any active subscriptions
	 *
	 * @example
	 * const channel = await events.connect("default/channel")
	 *
	 * channel.close()
	 *
	 */
	close(): void;
}

export type ResolvedGraphQLAuthModes = Exclude<GraphQLAuthMode, 'identityPool'>;

export interface EventsOptions {
	authMode?: GraphQLAuthMode;
	authToken?: string;
	apiKey?: string;
}

export interface PublishedEvent {
	identifier: string;
	index: number;
}

export interface PublishResponse {
	failed: PublishedEvent[];
	successful: PublishedEvent[];
}

interface EventsConfigure {
	appSyncGraphqlEndpoint: string;
	region?: string;
	authenticationType: ResolvedGraphQLAuthModes;
	apiKey?: string;
}

export type ProviderOptions = EventsConfigure & {
	authToken?: string;
};
