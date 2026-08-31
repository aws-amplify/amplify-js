// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InvalidAmplifyContextError } from '@aws-amplify/core/internals/utils';

import { PredictionsClass } from '../src/Predictions';

import { createMockAmplifyContext } from './testUtils';

describe('PredictionsClass constructor context guard (F3.1)', () => {
	it('throws InvalidAmplifyContextError when a defined-but-unbranded object is passed', () => {
		expect(() => new PredictionsClass({ resourcesConfig: {} } as any)).toThrow(
			InvalidAmplifyContextError,
		);
	});

	it('does not throw when no context is passed (global fallback path)', () => {
		expect(() => new PredictionsClass()).not.toThrow();
	});

	it('accepts a branded AmplifyContext', () => {
		expect(
			() => new PredictionsClass(createMockAmplifyContext({})),
		).not.toThrow();
	});
});
