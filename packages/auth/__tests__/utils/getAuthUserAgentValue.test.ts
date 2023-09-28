// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthAction,
	Category,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import { getAuthUserAgentValue } from '../../src/utils';

jest.mock('@aws-amplify/core/internals/utils');

describe('getAuthUserAgentValue', () => {
	// assert mocks
	const mockGetAmplifyUserAgent = getAmplifyUserAgent as jest.Mock;

	it('calls core getAmplifyUserAgent util with expected values', () => {
		const action = AuthAction.FederatedSignIn;
		getAuthUserAgentValue(action);

		expect(mockGetAmplifyUserAgent).toBeCalledWith({
			category: Category.Auth,
			action,
		});
	});
});
