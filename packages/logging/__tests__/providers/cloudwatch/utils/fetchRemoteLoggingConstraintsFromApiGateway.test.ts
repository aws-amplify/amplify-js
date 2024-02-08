// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	getLoggingConstraints,
	getLoggingConstraintsETag,
	setLoggingConstraintsETag,
} from '../../../../src/providers/cloudwatch/utils/loggingConstraintsHelpers';
import { LoggingConstraints } from '../../../../src/providers/cloudwatch/types/configuration';

jest.mock('@aws-amplify/core/internals/aws-client-utils');
jest.mock('@aws-amplify/core/internals/aws-client-utils/composers');
jest.mock(
	'../../../../src/providers/cloudwatch/utils/loggingConstraintsHelpers',
);

describe('CloudWatch Logging utils: fetchRemoteLoggingConstraints()', () => {
	let fetchRemoteLoggingConstraintsFromApiGateway: any;
	const eTag = 'e-tag';
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
	const parseError = new Error();
	// assert mocks
	const mockComposeServiceApi = composeServiceApi as jest.Mock;
	const mockGetLoggingConstraints = getLoggingConstraints as jest.Mock;
	const mockGetLoggingConstraintsETag = getLoggingConstraintsETag as jest.Mock;
	const mockParseJsonBody = parseJsonBody as jest.Mock;
	const mockParseJsonError = parseJsonError as jest.Mock;
	const mockSetLoggingConstraintsETag = setLoggingConstraintsETag as jest.Mock;

	// create mocks
	const mockApi = jest.fn();

	beforeAll(() => {
		mockParseJsonError.mockResolvedValue(parseError);
	});

	afterEach(() => {
		mockApi.mockClear();
		mockParseJsonBody.mockClear();
		mockParseJsonError.mockClear();
		mockSetLoggingConstraintsETag.mockClear();
		mockComposeServiceApi.mockReset();
		mockGetLoggingConstraints.mockReset();
		mockGetLoggingConstraintsETag.mockReset();
	});

	it('should compose an api', () => {
		mockComposeServiceApi.mockReturnValue(mockApi);
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});
		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
		expect(mockApi).toHaveBeenCalledWith({ credentials, region }, endpoint);
	});

	it('should serialize a request without an ETag', () => {
		const expectedSerializedRequest = {
			headers: { 'content-type': 'application/json' },
			method: 'GET',
			url: expect.objectContaining({ href: endpoint }),
		};

		mockComposeServiceApi.mockImplementation((_, serializer) => {
			expect(serializer(endpoint)).toStrictEqual(expectedSerializedRequest);
			return mockApi;
		});
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});

		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
	});

	it('should serialize a request with an ETag', () => {
		mockGetLoggingConstraintsETag.mockReturnValue(eTag);
		const expectedSerializedRequest = {
			headers: { 'content-type': 'application/json', 'If-None-Match': eTag },
			method: 'GET',
			url: expect.objectContaining({ href: endpoint }),
		};

		mockComposeServiceApi.mockImplementation((_, serializer) => {
			expect(serializer(endpoint)).toStrictEqual(expectedSerializedRequest);
			return mockApi;
		});
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});

		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
	});

	it('should deserialize a response and return cached constraint on 304 status', done => {
		mockGetLoggingConstraints.mockReturnValue(loggingConstraints);
		const response = { statusCode: 304 } as unknown as HttpResponse;

		mockComposeServiceApi.mockImplementation((_, __, deserializer) => {
			deserializer(response).then((constraints: LoggingConstraints) => {
				expect(constraints).toStrictEqual(loggingConstraints);
				done();
			});

			return mockApi;
		});
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});

		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
	});

	it('should throw an error on any other >= 300 status', done => {
		const response = { statusCode: 300 } as unknown as HttpResponse;

		mockComposeServiceApi.mockImplementation((_, __, deserializer) => {
			deserializer(response).catch((error: unknown) => {
				expect(error).toBe(parseError);
				done();
			});

			return mockApi;
		});
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});

		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
	});

	it('should deserialize a response and set an ETag', done => {
		mockParseJsonBody.mockResolvedValue(loggingConstraints);
		const response = {
			statusCode: 200,
			headers: { etag: eTag },
		} as unknown as HttpResponse;

		mockComposeServiceApi.mockImplementation((_, __, deserializer) => {
			deserializer(response).then((constraints: LoggingConstraints) => {
				expect(constraints).toStrictEqual(loggingConstraints);
				done();
			});

			return mockApi;
		});
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});

		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
	});

	it('should resolve an empty string as endpoint root', () => {
		mockComposeServiceApi.mockImplementation((_, __, ___, options) => {
			expect(options.endpointResolver()).toBe('');

			return mockApi;
		});
		jest.isolateModules(() => {
			({
				fetchRemoteLoggingConstraintsFromApiGateway,
			} = require('../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraintsFromApiGateway'));
		});

		fetchRemoteLoggingConstraintsFromApiGateway(
			{ credentials, region },
			endpoint,
		);
	});
});
