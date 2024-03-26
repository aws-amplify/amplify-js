// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

describe('Event listeners', () => {
	const eventType = 'foo';
	const mockHandler = jest.fn();
	let addEventListener,
		notifyEventListeners,
		notifyEventListenersAndAwaitHandlers;

	beforeEach(() => {
		({
			addEventListener,
			notifyEventListeners,
			notifyEventListenersAndAwaitHandlers,
		} = require('../../src/eventListeners'));
	});

	afterEach(() => {
		jest.resetModules();
		mockHandler.mockReset();
	});

	it('can be added', () => {
		const listener = addEventListener(eventType, mockHandler);
		expect(listener).toBeDefined();
	});

	it('can be notified', () => {
		const params = { foo: 'foo' };
		addEventListener(eventType, mockHandler);
		notifyEventListeners(eventType, params);

		expect(mockHandler).toHaveBeenCalledWith(params);
	});

	it('can be notified and awaited on', async () => {
		const params = { foo: 'foo' };
		mockHandler.mockImplementation(() => Promise.resolve());
		addEventListener(eventType, mockHandler);

		try {
			await notifyEventListenersAndAwaitHandlers(eventType, params);
			expect(mockHandler).toHaveBeenCalledWith(params);
		} catch (e) {}

		expect.assertions(1);
	});

	it('can handle async error', async () => {
		const mockHandler = jest.fn().mockImplementation(() => {
			throw new Error();
		});
		const params = { foo: 'foo' };
		addEventListener(eventType, mockHandler);

		await expect(
			notifyEventListenersAndAwaitHandlers(eventType, params),
		).rejects.toThrow();
		expect(mockHandler).toHaveBeenCalledWith(params);
	});

	it('can handle multiple parameters', () => {
		const param1 = { bar: 'bar' };
		const param2 = 'baz';
		addEventListener(eventType, mockHandler);
		notifyEventListeners(eventType, param1, param2);

		expect(mockHandler).toHaveBeenCalledWith(param1, param2);
	});

	it('can be removed', () => {
		const listener = addEventListener(eventType, mockHandler);

		listener.remove();
		notifyEventListeners(eventType);

		expect(mockHandler).not.toHaveBeenCalled();
	});

	it('can be added in multiples', () => {
		const barType = 'bar';
		const bazType = 'baz';
		const barHandler = jest.fn();
		const bazHandler = jest.fn();

		addEventListener(eventType, mockHandler);
		addEventListener(eventType, mockHandler);
		addEventListener(barType, barHandler);
		addEventListener(bazType, bazHandler);

		notifyEventListeners(eventType);
		notifyEventListeners(bazType);

		// two listeners added
		expect(mockHandler).toHaveBeenCalledTimes(2);
		// listener added but not notified
		expect(barHandler).toHaveBeenCalledTimes(0);
		// one listener added
		expect(bazHandler).toHaveBeenCalledTimes(1);
	});

	it('will not error out on an unregistered type', async () => {
		const unknownType = 'unknown';
		expect(notifyEventListeners(unknownType, {})).toBeUndefined();
		expect(
			await notifyEventListenersAndAwaitHandlers(unknownType, {}),
		).toStrictEqual([]);
	});
});
