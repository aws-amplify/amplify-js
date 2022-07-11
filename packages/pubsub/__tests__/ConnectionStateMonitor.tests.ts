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
	ConnectionState,
	ConnectionStateMonitor,
} from '../src/utils/ConnectionStateMonitor';

describe('ConnectionStateMonitor', () => {
	let monitor: ConnectionStateMonitor;
	let observedStates: ConnectionState[];
	let subscription: ZenObservable.Subscription;
	let reachabilityObserver: ZenObservable.Observer<{ online: boolean }>;

	beforeEach(() => {
		const spyon = jest
			.spyOn(Reachability.prototype, 'networkMonitor')
			.mockImplementationOnce(
				() =>
					new Observable(observer => {
						reachabilityObserver = observer;
					})
			);
	});

	describe('when the network is connected', () => {
		beforeEach(() => {
			reachabilityObserver?.next?.({ online: true });

			observedStates = [];
			subscription?.unsubscribe();
			monitor = new ConnectionStateMonitor();
			subscription = monitor.connectionHealthStateObservable.subscribe(
				value => {
					observedStates.push(value);
				}
			);
		});

		test('connection health states starts out disconnected', () => {
			expect(observedStates).toEqual(['Disconnected']);
		});

		test('standard health states connection pattern', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
			]);
		});

		test('connection health states when the network is lost while connected', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			reachabilityObserver?.next?.({ online: false });
			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingNetwork',
			]);
		});

		test('connection health states when the network is lost and the connection times out', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			reachabilityObserver?.next?.({ online: false });
			monitor.closed();
			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingNetwork',
				'ConnectionDisruptedPendingNetwork',
			]);
		});

		test('connection health states when the network is lost, the connection times out and then the network recovers', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			reachabilityObserver?.next?.({ online: false });
			monitor.closed();
			reachabilityObserver?.next?.({ online: true });
			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingNetwork',
				'ConnectionDisruptedPendingNetwork',
				'ConnectionDisrupted',
			]);
		});

		test('connection health states when a connection is no longer needed', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			monitor.closing();

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingDisconnect',
			]);
		});

		test('connection health states when a connection is no longer needed closed', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			monitor.closing();
			monitor.closed();

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingDisconnect',
				'Disconnected',
			]);
		});

		test('connection health states when a connection misses a keepalive, and then recovers', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			monitor.keepAliveMissed();
			monitor.keepAlive();

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingKeepAlive',
				'Connected',
			]);
		});

		test('lots of keep alive messages dont add more connection state events', () => {
			monitor.openingConnection();
			monitor.keepAlive();
			monitor.connectionEstablished();
			monitor.keepAlive();
			monitor.keepAlive();
			monitor.keepAlive();
			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
			]);
		});

		test('missed keep alives during a network outage dont add an additional state change', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			reachabilityObserver?.next?.({ online: false });
			monitor.keepAliveMissed();
			monitor.keepAliveMissed();

			expect(observedStates).toEqual([
				'Disconnected',
				'Connecting',
				'Connected',
				'ConnectedPendingNetwork',
			]);
		});

		test('when the network recovers, keep alives become the concern until one is seen', () => {
			monitor.openingConnection();
			monitor.connectionEstablished();
			reachabilityObserver?.next?.({ online: false });
			monitor.keepAliveMissed();
			monitor.keepAliveMissed();
			reachabilityObserver?.next?.({ online: true });
			monitor.keepAlive();

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
			subscription = monitor.connectionHealthStateObservable.subscribe(
				value => {
					observedStates.push(value);
				}
			);
		});

		test('starts out disconnected', () => {
			expect(observedStates).toEqual(['Disconnected']);
		});
	});
});
