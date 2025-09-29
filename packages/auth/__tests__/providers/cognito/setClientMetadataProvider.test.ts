// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';

jest.mock('../../../src/providers/cognito/tokenProvider');

const mockCognitoUserPoolsTokenProvider = jest.mocked(
	cognitoUserPoolsTokenProvider,
);

describe('setClientMetadataProvider', () => {
	it('should call tokenProvider.setClientMetadataProvider', () => {
		const clientMetadataProvider = {
			getClientMetadata: () => ({ 'app-version': '1.0.0' }),
		};

		cognitoUserPoolsTokenProvider.setClientMetadataProvider(
			clientMetadataProvider,
		);

		expect(
			mockCognitoUserPoolsTokenProvider.setClientMetadataProvider,
		).toHaveBeenCalledWith(clientMetadataProvider);
	});
});
