// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';
import { InvalidAmplifyContextError } from '@aws-amplify/core/internals/utils';

import { AWSIoT } from '../src/Providers/AWSIot';

function makeBrandedContext(): AmplifyContext {
	const ctx = {
		resourcesConfig: {},
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, { value: true });

	return ctx as unknown as AmplifyContext;
}

describe('AWSIoT constructor context guard (F3.1)', () => {
	it('throws InvalidAmplifyContextError when the (ctx, options) overload is used with an unbranded first arg', () => {
		expect(
			() => new AWSIoT({ region: 'us-east-1' } as any, { region: 'us-east-1' }),
		).toThrow(InvalidAmplifyContextError);
	});

	it('does not throw for the single-argument options overload (unbranded object is options)', () => {
		expect(() => new AWSIoT({ region: 'us-east-1' })).not.toThrow();
	});

	it('does not throw when no arguments are passed', () => {
		expect(() => new AWSIoT()).not.toThrow();
	});

	it('accepts a branded AmplifyContext in the (ctx, options) overload', () => {
		expect(
			() => new AWSIoT(makeBrandedContext(), { region: 'us-east-1' }),
		).not.toThrow();
	});

	it('forwards options passed via the (undefined ctx, options) overload instead of discarding them', () => {
		// Subclass to expose the protected `options` accessor for assertion
		// without resorting to unsafe casts.
		class ProbeAWSIoT extends AWSIoT {
			get exposedOptions() {
				return this.options;
			}
		}

		const instance = new ProbeAWSIoT(undefined, { region: 'us-west-2' });
		expect(instance.exposedOptions.region).toBe('us-west-2');
	});
});
