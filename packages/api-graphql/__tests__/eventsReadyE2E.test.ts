// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Observable, Observer } from 'rxjs';
import { Amplify } from '@aws-amplify/core';
import { Reachability } from '@aws-amplify/core/internals/utils';

import { events } from '../src/';
import { AppSyncEventProvider } from '../src/Providers/AWSAppSyncEventsProvider';
import { MESSAGE_TYPES } from '../src/Providers/constants';
import * as constants from '../src/Providers/constants';

import { delay, FakeWebSocketInterface } from './helpers';

// Defensive: apiKey auth does not sign, but keep the suite hermetic if auth
// resolution ever changes.
jest.mock('@aws-amplify/core/internals/aws-client-utils', () => {
	const original = jest.requireActual(
		'@aws-amplify/core/internals/aws-client-utils',
	);

	return {
		...original,
		signRequest: () => ({
			method: 'test',
			headers: { test: 'test' },
			url: new URL('http://example/'),
		}),
	};
});

/**
 * End-to-end regression for the `ready` rejection-value bug.
 *
 * This suite intentionally does NOT mock `AWSAppSyncEventsProvider` (unlike
 * `events.test.ts`). It drives the REAL provider through a
 * `FakeWebSocketInterface`, wired via the shared `AppSyncEventProvider`
 * singleton that `events.connect()` uses. That exercises the actual rxjs
 * `Subscriber` + the events layer's delegating `unsubscribe`/`ready` wiring, so
 * it would have caught the bug where `observer.error(...)` firing before
 * `onSubscriptionError(...)` made `ready` reject with a generic reason instead
 * of the real subscribe error.
 */
describe('events ready promise (end-to-end through the real provider)', () => {
	let fakeWebSocketInterface: FakeWebSocketInterface;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let reachabilityObserver: Observer<{ online: boolean }>;

	beforeEach(() => {
		Amplify.configure({
			API: {
				Events: {
					endpoint: 'ws://localhost:8080',
					region: 'us-east-1',
					defaultAuthMode: 'apiKey',
					apiKey: 'da2-test',
				},
			},
		});

		// Keep the network "online" (held observer, never emits offline).
		jest
			.spyOn(Reachability.prototype, 'networkMonitor')
			.mockImplementation(
				() =>
					new Observable(observer => {
						reachabilityObserver = observer;
					}),
			);

		fakeWebSocketInterface = new FakeWebSocketInterface();

		// Reset the shared singleton to a closed socket and hand out the fake one.
		Object.defineProperty(AppSyncEventProvider as any, 'socketStatus', {
			value: constants.SOCKET_STATUS.CLOSED,
			writable: true,
			configurable: true,
		});
		jest
			.spyOn(AppSyncEventProvider as any, '_getNewWebSocket')
			.mockImplementation(() => {
				fakeWebSocketInterface.newWebSocket();

				return fakeWebSocketInterface.webSocket as WebSocket;
			});
	});

	afterEach(async () => {
		try {
			await (AppSyncEventProvider as any).close?.();
		} catch {
			// ignore teardown errors
		}
		await fakeWebSocketInterface?.closeInterface();
		fakeWebSocketInterface?.teardown();
		jest.restoreAllMocks();
	});

	test('sub.ready rejects with the REAL subscribe error, not the generic close reason', async () => {
		expect.assertions(2);

		// Establish the connection (drive the handshake while connect is pending).
		const connectPromise = events.connect('default/channel');
		await fakeWebSocketInterface.standardConnectionHandshake();
		const channel = await connectPromise;

		const sub = channel.subscribe({
			next: () => {},
			error: () => {},
		});
		// Avoid unhandled-rejection noise before the assertion reads it.
		sub.ready.catch(() => undefined);

		// Wait until the subscribe frame has been sent and its id captured.
		for (
			let i = 0;
			i < 100 && !fakeWebSocketInterface.webSocket.subscriptionId;
			i++
		) {
			await delay(5);
		}

		// Drive a subscribe error BEFORE any start-ack. The provider calls
		// observer.error(...) (which rxjs turns into an internal unsubscribe) and
		// onSubscriptionError(...); `ready` must reject with the real error.
		await fakeWebSocketInterface.sendDataMessage({
			type: MESSAGE_TYPES.EVENT_SUBSCRIBE_ERROR,
			errors: [
				{
					errorType: 'AuthorizationError',
					message: 'Not authorized to access channel',
				},
			],
		});

		await expect(sub.ready).rejects.toThrow('Connection failed');
		await expect(sub.ready).rejects.toThrow(
			'Not authorized to access channel',
		);
	});
});
