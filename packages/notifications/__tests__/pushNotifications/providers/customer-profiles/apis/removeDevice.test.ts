// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { removeDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/removeDevice';

describe('removeDevice (customer-profiles, web stub)', () => {
	it('throws PlatformNotSupportedError', () => {
		expect(() => removeDevice()).toThrow(new PlatformNotSupportedError());
	});
});
