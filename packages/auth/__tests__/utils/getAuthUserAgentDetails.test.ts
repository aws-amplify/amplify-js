// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthAction, Category } from '@aws-amplify/core/internals/utils';
import { getAuthUserAgentDetails } from '../../src/utils';

describe('getAuthUserAgentDetails', () => {
	it('returns the correct user agent details', () => {
		const action = AuthAction.FederatedSignIn;

		expect(getAuthUserAgentDetails(action)).toStrictEqual({
			category: Category.Auth,
			action,
		});
	});
});
