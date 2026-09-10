// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ZenObservable } from 'zen-observable-ts';

export interface SubscriptionObserver<T> {
	closed: boolean;
	next(value: T): void;
	error(errorValue: any): void;
	complete(): void;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export enum CONTROL_MSG {
	CONNECTION_CLOSED = 'Connection closed',
	CONNECTION_FAILED = 'Connection failed',
	REALTIME_SUBSCRIPTION_INIT_ERROR = 'AppSync Realtime subscription init error',
	SUBSCRIPTION_ACK = 'Subscription ack',
	TIMEOUT_DISCONNECT = 'Timeout disconnect',
}

/**
 * @enum {string}
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
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

export type PubSubContent = Record<string, unknown> | string;
export type PubSubContentObserver =
	ZenObservable.SubscriptionObserver<PubSubContent>;
