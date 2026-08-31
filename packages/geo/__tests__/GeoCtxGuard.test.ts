// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InvalidAmplifyContextError } from '@aws-amplify/core/internals/utils';

import { GeoClass } from '../src/Geo';

import { createMockAmplifyContext } from './testUtils/mockAmplifyContext';

describe('GeoClass constructor context guard (F3.1)', () => {
	it('throws InvalidAmplifyContextError when a defined-but-unbranded object is passed', () => {
		expect(() => new GeoClass({ resourcesConfig: {} } as any)).toThrow(
			InvalidAmplifyContextError,
		);
	});

	it('does not throw when no context is passed (deferred/global path)', () => {
		expect(() => new GeoClass()).not.toThrow();
	});

	it('accepts a branded AmplifyContext', () => {
		expect(() => new GeoClass(createMockAmplifyContext({}))).not.toThrow();
	});
});
