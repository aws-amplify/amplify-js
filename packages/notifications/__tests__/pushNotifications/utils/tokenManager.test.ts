// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getToken,
	setToken,
} from '../../../src/pushNotifications/utils/tokenManager';
import { pushToken } from '../../testUtils/data';

describe('tokenManager', () => {
	const newToken = 'new-token';

	it('has no tokens set to start', () => {
		expect(getToken()).toBeUndefined();
	});

	it('can set and get a token', () => {
		setToken(pushToken);
		expect(getToken()).toBe(pushToken);
	});

	it('can overwrite an existing token', () => {
		setToken(newToken);
		expect(getToken()).toBe(newToken);
	});
});
