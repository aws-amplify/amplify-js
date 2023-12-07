// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBuffer } from '../../../src/utils';

describe('EventBuffer', () => {
	type TestEvent = {
		id: string;
		timestamp: number;
	};

	it('append events in order', done => {
		const result: TestEvent[] = [];
		const eventBuffer: EventBuffer<TestEvent> = new EventBuffer(
			{
				bufferSize: 2,
				flushSize: 1,
				flushInterval: 25,
			},
			() => events => {
				result.push(...events);
				return Promise.resolve([]);
			}
		);

		const testEvents: TestEvent[] = [
			{ id: '1', timestamp: 1 },
			{ id: '2', timestamp: 2 },
		];
		testEvents.forEach(x => eventBuffer.append(x));
		setTimeout(() => {
			eventBuffer.release();
			expect(result[0]).toEqual(testEvents[0]);
			expect(result[1]).toEqual(testEvents[1]);
			done();
		}, 100);
	});

	it('flush all events at once', done => {
		const results: number[] = [];
		const testEvents: TestEvent[] = [
			{ id: '1', timestamp: 1 },
			{ id: '2', timestamp: 2 },
			{ id: '3', timestamp: 3 },
		];

		const eventBuffer: EventBuffer<TestEvent> = new EventBuffer(
			{
				bufferSize: 3,
				flushSize: 1,
				flushInterval: 25,
			},
			() => events => {
				results.push(events.length);
				return Promise.resolve(events);
			}
		);

		testEvents.forEach(x => eventBuffer.append(x));
		setTimeout(() => {
			eventBuffer.release();
			expect(results.filter(x => x === testEvents.length).length).toEqual(1);
			expect(results.filter(x => x !== testEvents.length).length).toEqual(
				results.length - 1
			);
			done();
		}, 100);
		eventBuffer.flushAll();
	});

	it('release all resources', done => {
		const results: TestEvent[] = [];
		const testEvents: TestEvent[] = [
			{ id: '1', timestamp: 1 },
			{ id: '2', timestamp: 2 },
			{ id: '3', timestamp: 3 },
		];

		const eventBuffer: EventBuffer<TestEvent> = new EventBuffer(
			{
				bufferSize: 3,
				flushSize: 1,
				flushInterval: 25,
			},
			() => events => {
				results.push(...events);
				return Promise.resolve([]);
			}
		);

		testEvents.forEach(x => eventBuffer.append(x));
		setTimeout(() => {
			eventBuffer.release();
		}, 100);
		eventBuffer.append({ id: '4', timestamp: 4 });

		setTimeout(() => {
			expect(results.length).toEqual(testEvents.length);
			expect(results.filter(x => x.timestamp > results.length).length).toEqual(
				0
			);
			done();
		}, 150);
	});
});
