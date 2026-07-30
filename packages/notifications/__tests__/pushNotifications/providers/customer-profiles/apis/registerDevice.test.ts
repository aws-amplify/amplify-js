// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { registerDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice';

describe('registerDevice (customer-profiles, web stub)', () => {
	it('throws PlatformNotSupportedError', () => {
		expect(() => registerDevice({ token: 'token' })).toThrow(
			new PlatformNotSupportedError(),
		);
	});
});
