/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
export * from './Provider';
export * from './PubSub';

export interface SubscriptionObserver<T> {
	closed: boolean;
	next(value: T): void;
	error(errorValue: any): void;
	complete(): void;
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
