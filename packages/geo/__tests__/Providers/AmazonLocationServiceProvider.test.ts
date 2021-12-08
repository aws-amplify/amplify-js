/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { Credentials } from '@aws-amplify/core';
import {
	BatchPutGeofenceCommand,
	LocationClient,
	GetGeofenceCommand,
	SearchPlaceIndexForTextCommand,
	SearchPlaceIndexForPositionCommand,
} from '@aws-sdk/client-location';

import { AmazonLocationServiceProvider } from '../../src/Providers/AmazonLocationServiceProvider';
import {
	credentials,
	awsConfig,
	TestPlacePascalCase,
	testPlaceCamelCase,
	validGeofences,
	batchGeofencesCamelcaseResults,
	createGeofenceInputArray,
	mockBatchPutGeofenceCommandWithGetError,
	mockBatchPutGeofenceCommandWithNoGetError,
	validGeometry,
	mockGetGeofenceCommand,
	mockListGeofencesCommand,
	mockDeleteGeofencesCommand,
	mockBadGetGeofenceCommand,
} from '../data';
import {
	SearchByTextOptions,
	SearchByCoordinatesOptions,
	Coordinates,
	AmazonLocationServiceGeofence,
} from '../../src/types';

LocationClient.prototype.send = jest.fn(async command => {
	if (
		command instanceof SearchPlaceIndexForTextCommand ||
		command instanceof SearchPlaceIndexForPositionCommand
	) {
		return {
			Results: [
				{
					Place: TestPlacePascalCase,
				},
			],
		};
	}
});

describe('AmazonLocationServiceProvider', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		test('happy case', () => {
			const provider = new AmazonLocationServiceProvider();
		});
	});

	describe('getCategory', () => {
		test('should return "Geo" when asked for category', () => {
			const geo = new AmazonLocationServiceProvider();
			expect(geo.getCategory()).toBe('Geo');
		});
	});

	describe('getProviderName', () => {
		test('should return "AmazonLocationService" when asked for Provider', () => {
			const geo = new AmazonLocationServiceProvider();
			expect(geo.getProviderName()).toBe('AmazonLocationService');
		});
	});

	describe('configure', () => {
		test('should return a blank config object when none is passed in', () => {
			const geo = new AmazonLocationServiceProvider();
			const config = geo.configure();
			expect(config).toEqual({});
		});

		test('should return standard configuration given when passing to `geo.configure`', () => {
			const geo = new AmazonLocationServiceProvider();

			const config = geo.configure(awsConfig.geo.amazon_location_service);
			expect(config).toEqual(awsConfig.geo.amazon_location_service);
		});
	});

	describe('get map resources', () => {
		test('should tell you if there are no available map resources', () => {
			const provider = new AmazonLocationServiceProvider();
			provider.configure();
			expect(() => provider.getAvailableMaps()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should get all available map resources', () => {
			const provider = new AmazonLocationServiceProvider();
			provider.configure(awsConfig.geo.amazon_location_service);

			const maps = [];
			const availableMaps = awsConfig.geo.amazon_location_service.maps.items;
			const region = awsConfig.geo.amazon_location_service.region;
			for (const mapName in availableMaps) {
				const style = availableMaps[mapName].style;
				maps.push({ mapName, style, region });
			}

			expect(provider.getAvailableMaps()).toEqual(maps);
		});

		test('should tell you if there is no map resources available when calling getDefaultMap', () => {
			const provider = new AmazonLocationServiceProvider();
			provider.configure();

			expect(() => provider.getDefaultMap()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should tell you if there is no default map resource', () => {
			const provider = new AmazonLocationServiceProvider();
			provider.configure({
				maps: { testMap: { style: 'teststyle' } },
			});

			expect(() => provider.getDefaultMap()).toThrow(
				"No default map resource found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should get the default map resource', () => {
			const provider = new AmazonLocationServiceProvider();
			provider.configure(awsConfig.geo.amazon_location_service);

			const mapName = awsConfig.geo.amazon_location_service.maps.default;
			const style =
				awsConfig.geo.amazon_location_service.maps.items[mapName].style;
			const region = awsConfig.geo.amazon_location_service.region;

			const testMap = { mapName, style, region };

			const defaultMapsResource = provider.getDefaultMap();
			expect(defaultMapsResource).toEqual(testMap);
		});
	});

	describe('searchByText', () => {
		const testString = 'starbucks';

		test('should search with just text input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const results = await locationProvider.searchByText(testString);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should use biasPosition when given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
			};

			const results = await locationProvider.searchByText(
				testString,
				searchOptions
			);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;

			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				BiasPosition: searchOptions.biasPosition,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should use searchAreaConstraints when given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				searchAreaConstraints: [123, 456, 789, 321],
			};

			const resultsWithConstraints = await locationProvider.searchByText(
				testString,
				searchOptions
			);
			expect(resultsWithConstraints).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				FilterBBox: searchOptions.searchAreaConstraints,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should fail if credentials are invalid', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve();
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No credentials'
			);
		});

		test('should fail if _getCredentials fails ', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.reject();
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No credentials'
			);
		});

		test('should fail if there are no search index resources', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});

	describe('searchByCoordinates', () => {
		const testCoordinates: Coordinates = [45, 90];

		test('should search with just text input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const results = await locationProvider.searchByCoordinates(
				testCoordinates
			);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should use options when given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const searchOptions: SearchByCoordinatesOptions = {
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await locationProvider.searchByCoordinates(
				testCoordinates,
				searchOptions
			);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: searchOptions.searchIndexName,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should fail if credentials resolve to invalid', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve();
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates)
			).rejects.toThrow('No credentials');
		});

		test('should fail if _getCredentials fails ', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.reject();
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates)
			).rejects.toThrow('No credentials');
		});

		test('should fail if there are no search index resources', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			await expect(
				locationProvider.searchByCoordinates(testCoordinates)
			).rejects.toThrow(
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});

	describe('createGeofences', () => {
		test('createGeofences with multiple geofences', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommandWithGetError);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const results = await locationProvider.createGeofences(validGeofences);

			expect(results).toEqual(batchGeofencesCamelcaseResults);
		});

		test('createGeofences calls batchPutGeofences in batches of 10 from input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const numberOfGeofences = 44;
			const input = createGeofenceInputArray(numberOfGeofences);

			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(mockBatchPutGeofenceCommandWithGetError);

			const results = await locationProvider.createGeofences(input);

			const expected = {
				successes: input.map(({ geofenceId }) => {
					return {
						geofenceId,
						createTime: '2020-04-01T21:00:00.000Z',
						updateTime: '2020-04-01T21:00:00.000Z',
					};
				}),
				errors: [],
			};
			expect(results).toEqual(expected);

			const spyClientInput = spyonClient.mock.calls;
			const numberOfBatchCalls = Math.ceil(numberOfGeofences / 10);
			const numberOfGetGeofenceCalls = numberOfGeofences;
			const expectedNumberOfAPIRequests =
				numberOfBatchCalls + numberOfGetGeofenceCalls;

			expect(spyClientInput.length).toEqual(expectedNumberOfAPIRequests);
		});

		test('createGeofences errors out when a geofence already exists', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommandWithNoGetError);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const numberOfGeofences = 44;
			const input = createGeofenceInputArray(numberOfGeofences);
			const geofenceIdsExist: string[] = input.map(
				({ geofenceId }) => geofenceId
			);

			await expect(locationProvider.createGeofences(input)).rejects.toThrow(
				`GeofenceIds ${JSON.stringify(geofenceIdsExist)} already exist`
			);
		});

		test('createGeofences properly handles errors with bad network calls', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const input = createGeofenceInputArray(44);
			input[22].geofenceId = 'badId';
			const validEntries = [...input.slice(0, 20), ...input.slice(30, 44)];

			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(command => {
				if (command instanceof BatchPutGeofenceCommand) {
					const entries = command.input as any;

					if (entries.Entries.some(entry => entry.GeofenceId === 'badId')) {
						return Promise.reject(new Error('Bad network call'));
					}

					const resolution = {
						Successes: entries.Entries.map(({ GeofenceId }) => {
							return {
								GeofenceId,
								CreateTime: '2020-04-01T21:00:00.000Z',
								UpdateTime: '2020-04-01T21:00:00.000Z',
							};
						}),
						Errors: [],
					};
					return Promise.resolve(resolution);
				}
				if (command instanceof GetGeofenceCommand) {
					return mockBadGetGeofenceCommand(command);
				}
			});

			const results = await locationProvider.createGeofences(input);
			const badResults = input.slice(20, 30).map(input => {
				return {
					error: {
						code: 'APIConnectionError',
						message: 'Bad network call',
					},
					geofenceId: input.geofenceId,
				};
			});
			const expected = {
				successes: validEntries.map(({ geofenceId }) => {
					return {
						geofenceId,
						createTime: '2020-04-01T21:00:00.000Z',
						updateTime: '2020-04-01T21:00:00.000Z',
					};
				}),
				errors: badResults,
			};
			expect(results).toEqual(expected);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			await expect(
				locationProvider.createGeofences(validGeofences)
			).rejects.toThrowError(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});

	describe('updateGeofences', () => {
		test('updateGeofences with multiple geofences', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommandWithNoGetError);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const results = await locationProvider.updateGeofences(validGeofences);

			expect(results).toEqual(batchGeofencesCamelcaseResults);
		});

		test('updateGeofences calls batchPutGeofences in batches of 10 from input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const numberOfGeofences = 44;
			const input = createGeofenceInputArray(numberOfGeofences);

			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(mockBatchPutGeofenceCommandWithNoGetError);

			const results = await locationProvider.updateGeofences(input);

			const expected = {
				successes: input.map(({ geofenceId }) => {
					return {
						geofenceId,
						createTime: '2020-04-01T21:00:00.000Z',
						updateTime: '2020-04-01T21:00:00.000Z',
					};
				}),
				errors: [],
			};
			expect(results).toEqual(expected);

			const spyClientInput = spyonClient.mock.calls;
			const numberOfBatchCalls = Math.ceil(numberOfGeofences / 10);
			const numberOfGetGeofenceCalls = numberOfGeofences;
			const expectedNumberOfAPIRequests =
				numberOfBatchCalls + numberOfGetGeofenceCalls;

			expect(spyClientInput.length).toEqual(expectedNumberOfAPIRequests);
		});

		test('updateGeofences errors out when a geofence already exists', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommandWithGetError);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const numberOfGeofences = 44;
			const input = createGeofenceInputArray(numberOfGeofences);
			const geofenceIdsExist: string[] = input.map(
				({ geofenceId }) => geofenceId
			);

			await expect(locationProvider.updateGeofences(input)).rejects.toThrow(
				`GeofenceIds ${JSON.stringify(geofenceIdsExist)} do not already exist`
			);
		});

		test('updateGeofences properly handles errors with bad network calls', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const input = createGeofenceInputArray(44);
			input[22].geofenceId = 'badId';
			const validEntries = [...input.slice(0, 20), ...input.slice(30, 44)];

			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(command => {
				if (command instanceof BatchPutGeofenceCommand) {
					const entries = command.input as any;

					if (entries.Entries.some(entry => entry.GeofenceId === 'badId')) {
						return Promise.reject(new Error('Bad network call'));
					}

					const resolution = {
						Successes: entries.Entries.map(({ GeofenceId }) => {
							return {
								GeofenceId,
								CreateTime: '2020-04-01T21:00:00.000Z',
								UpdateTime: '2020-04-01T21:00:00.000Z',
							};
						}),
						Errors: [],
					};
					return Promise.resolve(resolution);
				}
				if (command instanceof GetGeofenceCommand) {
					return mockGetGeofenceCommand(command);
				}
			});

			const results = await locationProvider.updateGeofences(input);
			const badResults = input.slice(20, 30).map(input => {
				return {
					error: {
						code: 'APIConnectionError',
						message: 'Bad network call',
					},
					geofenceId: input.geofenceId,
				};
			});
			const expected = {
				successes: validEntries.map(({ geofenceId }) => {
					return {
						geofenceId,
						createTime: '2020-04-01T21:00:00.000Z',
						updateTime: '2020-04-01T21:00:00.000Z',
					};
				}),
				errors: badResults,
			};
			expect(results).toEqual(expected);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			await expect(
				locationProvider.updateGeofences(validGeofences)
			).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});

	describe('getGeofence', () => {
		test('getGeofence returns the right geofence', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockGetGeofenceCommand);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const results: AmazonLocationServiceGeofence =
				await locationProvider.getGeofence('geofenceId');

			const expected = {
				geofenceId: 'geofenceId',
				geometry: validGeometry,
				createTime: '2020-04-01T21:00:00.000Z',
				updateTime: '2020-04-01T21:00:00.000Z',
				status: 'ACTIVE',
			};

			await expect(results).toEqual(expected);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			await expect(locationProvider.getGeofence('geofenceId')).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});

	describe('listGeofences', () => {
		test('listGeofences gets the first 100 geofences when no arguments are given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockListGeofencesCommand);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const geofences = await locationProvider.listGeofences();

			expect(geofences.entries.length).toEqual(100);
		});

		test('listGeofences gets the second 100 geofences when nextToken is passed', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockListGeofencesCommand);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const first100Geofences = await locationProvider.listGeofences();

			const second100Geofences = await locationProvider.listGeofences({
				nextToken: first100Geofences.nextToken,
			});

			expect(second100Geofences.entries.length).toEqual(100);
			expect(second100Geofences.entries[0].geofenceId).toEqual(
				'validGeofenceId100'
			);
			expect(second100Geofences.entries[99].geofenceId).toEqual(
				'validGeofenceId199'
			);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			await expect(locationProvider.listGeofences()).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});

	describe('deleteGeofences', () => {
		test('deleteGeofences deletes given geofences successfully', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockDeleteGeofencesCommand);

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const geofenceIds = validGeofences.map(({ geofenceId }) => geofenceId);

			const results = await locationProvider.deleteGeofences(geofenceIds);

			const expected = {
				successes: geofenceIds,
				errors: [],
			};

			expect(results).toEqual(expected);
		});

		test('deleteGeofences calls batchDeleteGeofences in batches of 10 from input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const geofenceIds = validGeofences.map(({ geofenceId }) => geofenceId);

			const spyonProvider = jest.spyOn(locationProvider, 'deleteGeofences');
			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(mockDeleteGeofencesCommand);

			const results = await locationProvider.deleteGeofences(geofenceIds);

			const expected = {
				successes: geofenceIds,
				errors: [],
			};
			expect(results).toEqual(expected);

			const spyProviderInput = spyonProvider.mock.calls[0][0];

			const spyClientInput = spyonClient.mock.calls;

			expect(spyClientInput.length).toEqual(
				Math.ceil(spyProviderInput.length / 10)
			);
		});

		test('deleteGeofences properly handles errors with bad network calls', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_service);

			const input = createGeofenceInputArray(44).map(
				({ geofenceId }) => geofenceId
			);
			input[22] = 'badId';
			const validEntries = [...input.slice(0, 20), ...input.slice(30, 44)];

			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(geofenceInput => {
				const entries = geofenceInput.input as any;

				if (entries.GeofenceIds.some(entry => entry === 'badId')) {
					return Promise.reject(new Error('ResourceDoesNotExist'));
				}

				const resolution = {
					Errors: [
						{
							Error: {
								Code: 'ResourceDoesNotExist',
								Message: 'Resource does not exist',
							},
							GeofenceId: 'badId',
						},
					],
				};
				return Promise.resolve(resolution);
			});

			const results = await locationProvider.deleteGeofences(input);
			const badResults = input.slice(20, 30).map(geofenceId => {
				return {
					error: {
						code: 'ResourceDoesNotExist',
						message: 'ResourceDoesNotExist',
					},
					geofenceId,
				};
			});
			const expected = {
				successes: validEntries,
				errors: badResults,
			};
			expect(results).toEqual(expected);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServiceProvider();
			locationProvider.configure({});

			const geofenceIds = validGeofences.map(({ geofenceId }) => geofenceId);

			await expect(
				locationProvider.deleteGeofences(geofenceIds)
			).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.'
			);
		});
	});
});
