// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setTokenRefreshClientMetadata } from '../../../src/providers/cognito/apis/setTokenRefreshClientMetadata';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';

jest.mock('../../../src/providers/cognito/tokenProvider');

const mockTokenOrchestrator = jest.mocked(tokenOrchestrator);

describe('setTokenRefreshClientMetadata', () => {
	it('should call tokenOrchestrator.setTokenRefreshClientMetadata', () => {
		const clientMetadata = { 'app-version': '1.0.0' };

		setTokenRefreshClientMetadata(clientMetadata);

		expect(
			mockTokenOrchestrator.setTokenRefreshClientMetadata,
		).toHaveBeenCalledWith(clientMetadata);
	});
});
