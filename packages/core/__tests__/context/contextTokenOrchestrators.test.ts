// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getContextTokenOrchestrator,
	registerContextTokenOrchestrator,
} from '../../src/context/contextTokenOrchestrators';

interface MockOrchestrator {
	setTokens: jest.Mock;
}

const createMockOrchestrator = (): MockOrchestrator => ({
	setTokens: jest.fn(),
});

describe('contextTokenOrchestrators', () => {
	it('round-trips a registered provider -> orchestrator', () => {
		const provider = { getTokens: jest.fn() };
		const orchestrator = createMockOrchestrator();

		registerContextTokenOrchestrator(provider, orchestrator);

		expect(getContextTokenOrchestrator(provider)).toBe(orchestrator);
	});

	it('keeps distinct providers mapped to their own orchestrators', () => {
		const providerA = { getTokens: jest.fn() };
		const providerB = { getTokens: jest.fn() };
		const orchestratorA = createMockOrchestrator();
		const orchestratorB = createMockOrchestrator();

		registerContextTokenOrchestrator(providerA, orchestratorA);
		registerContextTokenOrchestrator(providerB, orchestratorB);

		expect(getContextTokenOrchestrator(providerA)).toBe(orchestratorA);
		expect(getContextTokenOrchestrator(providerB)).toBe(orchestratorB);
	});

	it('overwrites a previous registration for the same provider', () => {
		const provider = { getTokens: jest.fn() };
		const first = createMockOrchestrator();
		const second = createMockOrchestrator();

		registerContextTokenOrchestrator(provider, first);
		registerContextTokenOrchestrator(provider, second);

		expect(getContextTokenOrchestrator(provider)).toBe(second);
	});

	it('returns the value typed as the caller-supplied generic', () => {
		const provider = { getTokens: jest.fn() };
		const orchestrator = createMockOrchestrator();

		registerContextTokenOrchestrator(provider, orchestrator);

		const resolved = getContextTokenOrchestrator<MockOrchestrator>(provider);

		// Exercises the generic: `setTokens` is only reachable if `resolved` is
		// typed as MockOrchestrator rather than `unknown`.
		resolved?.setTokens();

		expect(orchestrator.setTokens).toHaveBeenCalledTimes(1);
	});

	it('returns undefined for an unregistered provider', () => {
		expect(
			getContextTokenOrchestrator({ getTokens: jest.fn() }),
		).toBeUndefined();
	});

	it('returns undefined when the provider is undefined', () => {
		expect(getContextTokenOrchestrator(undefined)).toBeUndefined();
	});
});
