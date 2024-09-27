// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createListLocationsHandler } from '../../../src/internals/managedAuthConfigAdapter/createListLocationsHandler';
import { _listCallerAccessGrants } from '../../../src/internals/apis/_listCallerAccessGrants';

jest.mock('../../../src/internals/apis/_listCallerAccessGrants');

jest.mocked(_listCallerAccessGrants).mockResolvedValue({
	locations: [],
});

describe('createListLocationsHandler', () => {
	it('should parse the underlying API with right parameters', async () => {
		const mockAccountId = '1234567890';
		const mockRegion = 'us-foo-1';
		const mockCredentialsProvider = jest.fn();
		const mockNextToken = '123';
		const mockPageSize = 123;
		const handler = createListLocationsHandler({
			accountId: mockAccountId,
			region: mockRegion,
			credentialsProvider: mockCredentialsProvider,
		});
		await handler({ nextToken: mockNextToken, pageSize: mockPageSize });
		expect(_listCallerAccessGrants).toHaveBeenCalledWith({
			accountId: mockAccountId,
			region: mockRegion,
			credentialsProvider: mockCredentialsProvider,
			nextToken: mockNextToken,
			pageSize: mockPageSize,
		});
	});
});
