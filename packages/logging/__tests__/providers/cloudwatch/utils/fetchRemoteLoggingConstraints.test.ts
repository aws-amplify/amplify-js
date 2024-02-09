// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingConstraints } from '../../../../src/providers/cloudwatch/types/configuration';
import { fetchRemoteLoggingConstraintsFromApiGateway } from '../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway';
import { resolveConfig } from '../../../../src/providers/cloudwatch/utils/resolveConfig';
import { resolveCredentials } from '../../../../src/providers/cloudwatch/utils/resolveCredentials';
import { fetchRemoteLoggingConstraints } from '../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraints';
import { LoggingError } from '../../../../src/errors';

jest.mock(
	'../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway',
);
jest.mock('../../../../src/providers/cloudwatch/utils/resolveConfig');
jest.mock('../../../../src/providers/cloudwatch/utils/resolveCredentials');

describe('CloudWatch Logging utils: fetchRemoteLoggingConstraints()', () => {
	const endpoint = 'https://domain.fakeurl/';
	const region = 'region';
	const credentials = {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
	};
	const loggingConstraints: LoggingConstraints = {
		defaultLogLevel: 'INFO',
		categoryLogLevel: {
			API: 'INFO',
			AUTH: 'INFO',
		},
	};
	// assert mocks
	const mockFetchRemoteLoggingConstraintsFromApiGateway =
		fetchRemoteLoggingConstraintsFromApiGateway as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;

	beforeAll(() => {
		mockResolveConfig.mockReturnValue({ region });
		mockResolveCredentials.mockResolvedValue({ credentials });
	});

	beforeEach(() => {
		mockFetchRemoteLoggingConstraintsFromApiGateway.mockResolvedValue(
			loggingConstraints,
		);
	});

	afterEach(() => {
		mockFetchRemoteLoggingConstraintsFromApiGateway.mockReset();
		mockResolveConfig.mockClear();
		mockResolveCredentials.mockClear();
	});

	it('should try to fetch remote logging constraints from API Gateway', async () => {
		expect(await fetchRemoteLoggingConstraints(endpoint)).toBe(
			loggingConstraints,
		);
	});

	it('should throw an error on fetching failure', async () => {
		mockFetchRemoteLoggingConstraintsFromApiGateway.mockImplementation(() => {
			throw new Error();
		});
		await expect(fetchRemoteLoggingConstraints(endpoint)).rejects.toThrow(
			LoggingError,
		);
	});
});
