// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

import { deprecatePinpoint } from '../../src/utils/deprecatePinpoint';

describe('deprecatePinpoint', () => {
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');

	beforeEach(() => {
		loggerWarnSpy.mockClear();
	});

	it('delegates arguments and return value transparently', () => {
		const impl = jest.fn((a: number, b: number) => a + b);
		const wrapped = deprecatePinpoint(impl);

		const result = wrapped(2, 3);

		expect(result).toBe(5);
		expect(impl).toHaveBeenCalledWith(2, 3);
	});

	it('emits the deprecation warning only once across multiple calls', () => {
		const wrapped = deprecatePinpoint(jest.fn());

		wrapped();
		wrapped();
		wrapped();

		expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
		expect(loggerWarnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Amazon Pinpoint'),
		);
		expect(loggerWarnSpy).toHaveBeenCalledWith(
			expect.stringContaining('@aws-amplify/analytics/kinesis'),
		);
	});

	it('tracks the one-time warning independently per wrapped API', () => {
		const wrappedA = deprecatePinpoint(jest.fn());
		const wrappedB = deprecatePinpoint(jest.fn());

		wrappedA();
		wrappedA();
		wrappedB();

		expect(loggerWarnSpy).toHaveBeenCalledTimes(2);
	});

	it('preserves thrown errors from the wrapped implementation', () => {
		const wrapped = deprecatePinpoint(() => {
			throw new Error('boom');
		});

		expect(() => wrapped()).toThrow('boom');
	});
});
