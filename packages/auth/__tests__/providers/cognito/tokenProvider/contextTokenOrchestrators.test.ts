// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { registerContextTokenOrchestrator } from '@aws-amplify/core/internals/utils';

import { resolveTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/contextTokenOrchestrators';
import { tokenOrchestrator as globalTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { TokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/TokenOrchestrator';

const createMockOrchestrator = (): TokenOrchestrator =>
	({
		setTokens: jest.fn(),
	}) as unknown as TokenOrchestrator;

const createMockContext = (tokenProvider?: object): AmplifyContext =>
	({
		libraryOptions: { Auth: { tokenProvider } },
	}) as unknown as AmplifyContext;

describe('resolveTokenOrchestrator', () => {
	it('returns the per-context orchestrator on a registry hit', () => {
		const provider = { getTokens: jest.fn() };
		const orchestrator = createMockOrchestrator();
		registerContextTokenOrchestrator(provider, orchestrator);

		expect(resolveTokenOrchestrator(createMockContext(provider))).toBe(
			orchestrator,
		);
	});

	it('keeps distinct contexts on their own orchestrators', () => {
		const providerA = { getTokens: jest.fn() };
		const providerB = { getTokens: jest.fn() };
		const orchestratorA = createMockOrchestrator();
		const orchestratorB = createMockOrchestrator();
		registerContextTokenOrchestrator(providerA, orchestratorA);
		registerContextTokenOrchestrator(providerB, orchestratorB);

		expect(resolveTokenOrchestrator(createMockContext(providerA))).toBe(
			orchestratorA,
		);
		expect(resolveTokenOrchestrator(createMockContext(providerB))).toBe(
			orchestratorB,
		);
	});

	it('falls back to the global singleton on a registry miss', () => {
		const unregisteredProvider = { getTokens: jest.fn() };

		expect(
			resolveTokenOrchestrator(createMockContext(unregisteredProvider)),
		).toBe(globalTokenOrchestrator);
	});

	it('falls back to the global singleton when ctx is undefined', () => {
		expect(resolveTokenOrchestrator(undefined)).toBe(globalTokenOrchestrator);
	});

	it('falls back to the global singleton when ctx has no token provider', () => {
		expect(resolveTokenOrchestrator(createMockContext())).toBe(
			globalTokenOrchestrator,
		);
	});
});
