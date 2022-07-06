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

// Internal types for tracking different connection states
type ConnectivityState = 'connected' | 'disconnected';
type HealthState = 'healthy' | 'unhealthy';
type ConnectionState = {
	networkState: ConnectivityState;
	connectionState: ConnectivityState | 'connecting';
	intendedConnectionState: ConnectivityState;
	keepAliveState: HealthState;
};

export type ConnectionHealthState =
	| 'Connected'
	| 'ConnectedPendingNetwork'
	| 'ConnectionDisrupted'
	| 'ConnectionDisruptedPendingNetwork'
	| 'Connecting'
	| 'ConnectedPendingDisconnect'
	| 'Disconnected'
	| 'ConnectedPendingKeepAlive';

export class ConnectionStateMonitor {
	/**
	 * @private
	 */
	private _connectionState: ConnectionState;
	private _connectionStateObservable: Observable<ConnectionState>;
	private _connectionStateObserver: ZenObservable.SubscriptionObserver<ConnectionState>;

	constructor() {
		this._connectionState = {
			networkState: 'connected',
			connectionState: 'disconnected',
			intendedConnectionState: 'disconnected',
			keepAliveState: 'healthy',
		};

		this._connectionStateObservable = new Observable<ConnectionState>(
			connectionStateObserver => {
				connectionStateObserver.next(this._connectionState);
				this._connectionStateObserver = connectionStateObserver;
			}
		);

		// Maintain the network state based on the reachability monitor
		new Reachability().networkMonitor().subscribe(({ online }) => {
			this.updateConnectionState({
				networkState: online ? 'connected' : 'disconnected',
			});
		});
	}

	/**
	 * Get the observable that allows us to monitor the connection health
	 *
	 * @returns {Observable<ConnectionHealthState>} - The observable that emits ConnectionHealthState updates
	 */
	public get connectionHealthStateObservable(): Observable<ConnectionHealthState> {
		// Translate from connection states to ConnectionHealthStates, then remove any duplicates
		let previous: ConnectionHealthState;
		return this._connectionStateObservable
			.map(value => {
				return this.connectionStateToConnectionHealth(value);
			})
			.filter(current => {
				const toInclude = current !== previous;
				previous = current;
				return toInclude;
			});
	}

	/**
	 * Tell the monitor that the connection has been disconnected
	 */
	disconnected() {
		this.updateConnectionState({ connectionState: 'disconnected' });
	}

	/**
	 * Tell the monitor that the connection is opening
	 */
	openingConnection() {
		this.updateConnectionState({
			intendedConnectionState: 'connected',
			connectionState: 'connecting',
		});
	}

	/**
	 * Tell the monitor that the connection is disconnecting
	 */
	disconnecting() {
		this.updateConnectionState({ intendedConnectionState: 'disconnected' });
	}

	/**
	 * Tell the monitor that the connection has failed
	 */
	connectionFailed() {
		this.updateConnectionState({
			intendedConnectionState: 'disconnected',
			connectionState: 'disconnected',
		});
	}

	/**
	 * Tell the monitor that the connection has been established
	 */
	connectionEstablished() {
		this.updateConnectionState({ connectionState: 'connected' });
	}

	/**
	 * Tell the monitor that a keep alive has occurred
	 */
	keepAlive() {
		this.updateConnectionState({ keepAliveState: 'healthy' });
	}

	/**
	 * Tell the monitor that a keep alive has been missed
	 */
	keepAliveMissed() {
		this.updateConnectionState({ keepAliveState: 'unhealthy' });
	}

	/**
	 * @private
	 */

	private updateConnectionState(statusUpdates: Partial<ConnectionState>) {
		// Maintain the socket state
		const newSocketStatus = { ...this._connectionState, ...statusUpdates };

		this._connectionState = { ...newSocketStatus };

		this._connectionStateObserver.next({ ...this._connectionState });
	}

	/*
	 * Translate the ConnectionState structure into a specific ConnectionHealthState string literal union
	 */
	private connectionStateToConnectionHealth({
		connectionState,
		networkState,
		intendedConnectionState,
		keepAliveState,
	}: ConnectionState): ConnectionHealthState {
		if (connectionState === 'connected' && networkState === 'disconnected')
			return 'ConnectedPendingNetwork';

		if (
			connectionState === 'connected' &&
			intendedConnectionState === 'disconnected'
		)
			return 'ConnectedPendingDisconnect';

		if (
			connectionState === 'disconnected' &&
			intendedConnectionState === 'connected' &&
			networkState === 'disconnected'
		)
			return 'ConnectionDisruptedPendingNetwork';

		if (
			connectionState === 'disconnected' &&
			intendedConnectionState === 'connected'
		)
			return 'ConnectionDisrupted';

		if (connectionState === 'connected' && keepAliveState === 'unhealthy')
			return 'ConnectedPendingKeepAlive';

		// All remaining states directly correspond to the connection state
		if (connectionState === 'connecting') return 'Connecting';
		if (connectionState === 'disconnected') return 'Disconnected';
		return 'Connected';
	}
}
