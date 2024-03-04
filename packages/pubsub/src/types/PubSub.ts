// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable, Observer } from 'rxjs';

export interface SubscriptionObserver<T> {
	closed: boolean;
	next(value: T): void;
	error(errorValue: any): void;
	complete(): void;
}

export enum CONTROL_MSG {
	CONNECTION_CLOSED = 'Connection closed',
	CONNECTION_FAILED = 'Connection failed',
	REALTIME_SUBSCRIPTION_INIT_ERROR = 'AppSync Realtime subscription init error',
	SUBSCRIPTION_ACK = 'Subscription ack',
	TIMEOUT_DISCONNECT = 'Timeout disconnect',
}

/** @enum {string} */
export enum ConnectionState {
	/*
	 * The connection is alive and healthy
	 */
	Connected = 'Connected',
	/*
	 * The connection is alive, but the connection is offline
	 */
	ConnectedPendingNetwork = 'ConnectedPendingNetwork',
	/*
	 * The connection has been disconnected while in use
	 */
	ConnectionDisrupted = 'ConnectionDisrupted',
	/*
	 * The connection has been disconnected and the network is offline
	 */
	ConnectionDisruptedPendingNetwork = 'ConnectionDisruptedPendingNetwork',
	/*
	 * The connection is in the process of connecting
	 */
	Connecting = 'Connecting',
	/*
	 * The connection is not in use and is being disconnected
	 */
	ConnectedPendingDisconnect = 'ConnectedPendingDisconnect',
	/*
	 * The connection is not in use and has been disconnected
	 */
	Disconnected = 'Disconnected',
	/*
	 * The connection is alive, but a keep alive message has been missed
	 */
	ConnectedPendingKeepAlive = 'ConnectedPendingKeepAlive',
}

export type PubSubContent = Record<string, unknown>;
export type PubSubContentObserver = Observer<PubSubContent>;

export interface PubSubOptions {
	[key: string]: any;
	provider?: string | symbol;
}

export interface PubSubBase {
	// configure your provider
	configure(config: Record<string, unknown>): Record<string, unknown>;

	publish(input: PublishInput): void;

	subscribe(input: SubscribeInput): Observable<PubSubContent>;
}

export interface PublishInput {
	topics: string[] | string;
	message: PubSubContent;
	options?: PubSubOptions;
}

export interface SubscribeInput {
	topics: string[] | string;
	options?: PubSubOptions;
}
