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

jest.mock('@aws-amplify/core', () => ({
	__esModule: true,
	...jest.requireActual('@aws-amplify/core'),
	browserOrNode() {
		return {
			isBrowser: true,
			isNode: false,
		};
	},
}));

import Observable from 'zen-observable-ts';
import { Reachability } from '@aws-amplify/core';
import {
	ConnectionStateMonitor,
	CONNECTION_CHANGE,
} from '../src/utils/ConnectionStateMonitor';
import { ConnectionState as CS } from '../src';

describe('ConnectionStateMonitor', () => {
	let monitor: ConnectionStateMonitor;
	let observedStates: CS[];
	let subscription: ZenObservable.Subscription;
	let reachabilityObserver: ZenObservable.Observer<{ online: boolean }>;

	beforeEach(() => {
		const spyon = jest
			.spyOn(Reachability.prototype, 'networkMonitor')
			.mockImplementationOnce(() => {
				return new Observable(observer => {
					reachabilityObserver = observer;
				});
			})
			// Twice because we subscribe to get the initial state then again to monitor reachability
			.mockImplementationOnce(() => {
				return new Observable(observer => {
					reachabilityObserver = observer;
				});
			});
	});

	describe('when the network is connected', () => {
		beforeEach(() => {
			reachabilityObserver?.next?.({ online: true });

			observedStates = [];
			subscription?.unsubscribe();
			monitor = new ConnectionStateMonitor();
			subscription = monitor.connectionStateObservable.subscribe(value => {
				observedStates.push(value);
			});
		});

		test('connection states starts out disconnected', () => {
			expect(observedStates).toEqual(['Disconnected']);
		});

		test('standard states connection pattern', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			expect(observedStates).toEqual([
				CS.Disconnected,
				CS.Connecting,
				CS.Connected,
			]);
		});

		test('connection states when the network is lost while connected', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			reachabilityObserver?.next?.({ online: false });
			expect(observedStates).toEqual([
				CS.Disconnected,
				CS.Connecting,
				CS.Connected,
				CS.ConnectedPendingNetwork,
			]);
		});

		test('connection states when the network is lost and the connection times out', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			reachabilityObserver?.next?.({ online: false });
			monitor.record(CONNECTION_CHANGE.CLOSED);
			expect(observedStates).toEqual([
				CS.Disconnected,
				CS.Connecting,
				CS.Connected,
				CS.ConnectedPendingNetwork,
				CS.ConnectionDisruptedPendingNetwork,
			]);
		});

		test('connection states when the network is lost, the connection times out and then the network recovers', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			reachabilityObserver?.next?.({ online: false });
			monitor.record(CONNECTION_CHANGE.CLOSED);
			reachabilityObserver?.next?.({ online: true });
			expect(observedStates).toEqual([
				CS.Disconnected,
				CS.Connecting,
				CS.Connected,
				CS.ConnectedPendingNetwork,
				CS.ConnectionDisruptedPendingNetwork,
				CS.ConnectionDisrupted,
			]);
		});

		test('connection states when a connection is no longer needed', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			monitor.record(CONNECTION_CHANGE.CLOSING_CONNECTION);

			expect(observedStates).toEqual([
				CS.Disconnected,
				CS.Connecting,
				CS.Connected,
				CS.ConnectedPendingDisconnect,
			]);
		});

		test('connection states when a connection is no longer needed closed', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			monitor.record(CONNECTION_CHANGE.CLOSING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CLOSED);

			expect(observedStates).toEqual([
				CS.Disconnected,
				CS.Connecting,
				CS.Connected,
				CS.ConnectedPendingDisconnect,
				CS.Disconnected,
			]);
		});

		test('connection states when a connection misses a keepalive, and then recovers', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE);

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingKeepAlive',
				'Connected',
			]);
		});

		test('lots of keep alive messages dont add more connection state events', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE);

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
			]);
		});

		test('missed keep alives during a network outage dont add an additional state change', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			reachabilityObserver?.next?.({ online: false });
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingNetwork',
			]);
		});

		test('when the network recovers, keep alives become the concern until one is seen', () => {
			monitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
			monitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
			reachabilityObserver?.next?.({ online: false });
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
			reachabilityObserver?.next?.({ online: true });
			monitor.record(CONNECTION_CHANGE.KEEP_ALIVE);

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingNetwork',
				'ConnectedPendingKeepAlive',
				'Connected',
			]);
		});
	});

	describe('when the network is disconnected', () => {
		beforeEach(() => {
			reachabilityObserver?.next?.({ online: false });

			observedStates = [];
			subscription?.unsubscribe();
			monitor = new ConnectionStateMonitor();
			subscription = monitor.connectionStateObservable.subscribe(value => {
				observedStates.push(value);
			});
		});

		test('starts out disconnected', () => {
			expect(observedStates).toEqual(['Disconnected']);
		});
	});
});
