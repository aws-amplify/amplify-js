// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getContextTokenOrchestrator,
	registerContextTokenOrchestrator,
} from '../../../../src/providers/cognito/tokenProvider/contextTokenOrchestrators';
import { AuthTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/types';

const createMockOrchestrator = (): AuthTokenOrchestrator =>
	({
		setTokens: jest.fn(),
	}) as unknown as AuthTokenOrchestrator;

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

	it('returns undefined for an unregistered provider', () => {
		expect(
			getContextTokenOrchestrator({ getTokens: jest.fn() }),
		).toBeUndefined();
	});

	it('returns undefined when the provider is undefined', () => {
		expect(getContextTokenOrchestrator(undefined)).toBeUndefined();
	});
});
