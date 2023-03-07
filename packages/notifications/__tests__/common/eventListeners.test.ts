// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

describe('Event listeners', () => {
	const fooType = 'foo';
	const fooHandler = jest.fn();
	let addEventListener,
		notifyEventListeners,
		notifyEventListenersAndAwaitHandlers;
	beforeEach(() => {
		({
			addEventListener,
			notifyEventListeners,
			notifyEventListenersAndAwaitHandlers,
		} = require('../../src/common/eventListeners'));
	});
	afterEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	test('can be added', () => {
		const listener = addEventListener(fooType, fooHandler);
		expect(listener).toBeDefined();
	});

	test('can be notified', () => {
		const param = { bar: 'bar' };
		addEventListener(fooType, fooHandler);
		notifyEventListeners(fooType, param);

		expect(fooHandler).toBeCalledWith(param);
	});

	test('can be notified and awaited on', async () => {
		const asyncType = 'async';
		const asyncHandler = jest.fn().mockImplementation(() => Promise.resolve());
		const param = { bar: 'bar' };
		addEventListener(asyncType, asyncHandler);

		try {
			await notifyEventListenersAndAwaitHandlers(asyncType, param);
			expect(asyncHandler).toBeCalledWith(param);
		} catch (e) {}

		expect.hasAssertions();
	});

	test('can handle async error', async () => {
		const errType = 'err';
		const err = new Error();
		const errHandler = jest.fn().mockImplementation(() => {
			throw err;
		});
		const param = { bar: 'bar' };
		addEventListener(errType, errHandler);

		try {
			await notifyEventListenersAndAwaitHandlers(errType, param);
		} catch (e) {
			expect(errHandler).toBeCalledWith(param);
			expect(e).toBe(err);
		}

		expect.hasAssertions();
	});

	test('can handle multiple parameters', () => {
		const param1 = { bar: 'bar' };
		const param2 = 'baz';
		addEventListener(fooType, fooHandler);
		notifyEventListeners(fooType, param1, param2);

		expect(fooHandler).toBeCalledWith(param1, param2);
	});

	test('can be removed', () => {
		const listener = addEventListener(fooType, fooHandler);

		listener.remove();
		notifyEventListeners(fooType);

		expect(fooHandler).not.toBeCalled();
	});

	test('can be added in multiples', () => {
		const barType = 'bar';
		const bazType = 'baz';
		const barHandler = jest.fn();
		const bazHandler = jest.fn();

		addEventListener(fooType, fooHandler);
		addEventListener(fooType, fooHandler);
		addEventListener(barType, barHandler);
		addEventListener(bazType, bazHandler);

		notifyEventListeners(fooType);
		notifyEventListeners(bazType);

		// two listeners added
		expect(fooHandler).toBeCalledTimes(2);
		// listener added but not notified
		expect(barHandler).toBeCalledTimes(0);
		// one listener added
		expect(bazHandler).toBeCalledTimes(1);
	});

	test('will not error out on an unregistered type', async () => {
		const unknownType = 'unknown';
		expect(notifyEventListeners(unknownType, {})).toBeUndefined();
		expect(
			await notifyEventListenersAndAwaitHandlers(unknownType, {})
		).toStrictEqual([]);
	});
});
