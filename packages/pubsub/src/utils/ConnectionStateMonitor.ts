/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Reachability } from '@aws-amplify/core';
import Observable, { ZenObservable } from 'zen-observable-ts';
import { ConnectionState } from '../index';

// Internal types for tracking different connection states
type LinkedConnectionState = 'connected' | 'disconnected';
type LinkedHealthState = 'healthy' | 'unhealthy';
type LinkedConnectionStates = {
	networkState: LinkedConnectionState;
	connectionState: LinkedConnectionState | 'connecting';
	intendedConnectionState: LinkedConnectionState;
	keepAliveState: LinkedHealthState;
};

export const CONNECTION_CHANGE: {
	[key in
		| 'KEEP_ALIVE_MISSED'
		| 'KEEP_ALIVE'
		| 'CONNECTION_ESTABLISHED'
		| 'CONNECTION_FAILED'
		| 'CLOSING'
		| 'OPENING_CONNECTION'
		| 'CLOSED'
		| 'ONLINE'
		| 'OFFLINE']: Partial<LinkedConnectionStates>;
} = {
	KEEP_ALIVE_MISSED: { keepAliveState: 'unhealthy' },
	KEEP_ALIVE: { keepAliveState: 'healthy' },
	CONNECTION_ESTABLISHED: { connectionState: 'connected' },
	CONNECTION_FAILED: {
		intendedConnectionState: 'disconnected',
		connectionState: 'disconnected',
	},
	CLOSING: { intendedConnectionState: 'disconnected' },
	OPENING_CONNECTION: {
		intendedConnectionState: 'connected',
		connectionState: 'connecting',
	},
	CLOSED: { connectionState: 'disconnected' },
	ONLINE: { networkState: 'connected' },
	OFFLINE: { networkState: 'disconnected' },
};

export class ConnectionStateMonitor {
	/**
	 * @private
	 */
	private _linkedConnectionState: LinkedConnectionStates;
	private _linkedConnectionStateObservable: Observable<LinkedConnectionStates>;
	private _linkedConnectionStateObserver: ZenObservable.SubscriptionObserver<LinkedConnectionStates>;

	constructor() {
		this._linkedConnectionState = {
			networkState: 'connected',
			connectionState: 'disconnected',
			intendedConnectionState: 'disconnected',
			keepAliveState: 'healthy',
		};

		this._linkedConnectionStateObservable =
			new Observable<LinkedConnectionStates>(connectionStateObserver => {
				connectionStateObserver.next(this._linkedConnectionState);
				this._linkedConnectionStateObserver = connectionStateObserver;
			});

		// Maintain the network state based on the reachability monitor
		new Reachability().networkMonitor().subscribe(({ online }) => {
			this.record(
				online ? CONNECTION_CHANGE.ONLINE : CONNECTION_CHANGE.OFFLINE
			);
		});
	}

	/**
	 * Get the observable that allows us to monitor the connection state
	 *
	 * @returns {Observable<ConnectionState>} - The observable that emits ConnectionState updates
	 */
	public get connectionStateObservable(): Observable<ConnectionState> {
		let previous: ConnectionState;

		// The linked state aggregates state changes to any of the network, connection,
		// intendedConnection and keepAliveHealth. Some states will change these independent
		// states without changing the overall connection state.

		// After translating from linked states to ConnectionState, then remove any duplicates
		return this._linkedConnectionStateObservable
			.map(value => {
				return this.linkedConnectionStatesToConnectionState(value);
			})
			.filter(current => {
				const toInclude = current !== previous;
				previous = current;
				return toInclude;
			});
	}

	/*
	 * Updates local connection state and emits the full state to the observer.
	 */
	record(statusUpdates: Partial<LinkedConnectionStates>) {
		// Maintain the socket state
		const newSocketStatus = {
			...this._linkedConnectionState,
			...statusUpdates,
		};

		this._linkedConnectionState = { ...newSocketStatus };

		this._linkedConnectionStateObserver.next(this._linkedConnectionState);
	}

	/*
	 * Translate the ConnectionState structure into a specific ConnectionState string literal union
	 */
	private linkedConnectionStatesToConnectionState({
		connectionState,
		networkState,
		intendedConnectionState,
		keepAliveState,
	}: LinkedConnectionStates): ConnectionState {
		if (connectionState === 'connected' && networkState === 'disconnected')
			return ConnectionState.ConnectedPendingNetwork;

		if (
			connectionState === 'connected' &&
			intendedConnectionState === 'disconnected'
		)
			return ConnectionState.ConnectedPendingDisconnect;

		if (
			connectionState === 'disconnected' &&
			intendedConnectionState === 'connected' &&
			networkState === 'disconnected'
		)
			return ConnectionState.ConnectionDisruptedPendingNetwork;

		if (
			connectionState === 'disconnected' &&
			intendedConnectionState === 'connected'
		)
			return ConnectionState.ConnectionDisrupted;

		if (connectionState === 'connected' && keepAliveState === 'unhealthy')
			return ConnectionState.ConnectedPendingKeepAlive;

		// All remaining states directly correspond to the connection state
		if (connectionState === 'connecting') return ConnectionState.Connecting;
		if (connectionState === 'disconnected') return ConnectionState.Disconnected;
		return ConnectionState.Connected;
	}
}
