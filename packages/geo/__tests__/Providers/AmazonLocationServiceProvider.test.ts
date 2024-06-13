// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	GetPlaceCommand,
	LocationClient,
	SearchPlaceIndexForPositionCommand,
	SearchPlaceIndexForSuggestionsCommand,
	SearchPlaceIndexForTextCommand,
} from '@aws-sdk/client-location';
import camelcaseKeys from 'camelcase-keys';

import { AmazonLocationServiceProvider } from '../../src/providers/location-service/AmazonLocationServiceProvider';
import {
	TestPlacePascalCase,
	awsConfig,
	awsConfigGeoV4,
	batchGeofencesCamelcaseResults,
	clockwiseGeofence,
	credentials,
	testPlaceCamelCase,
	validGeofences,
	validGeometry,
} from '../testData';
import {
	createGeofenceInputArray,
	mockBatchPutGeofenceCommand,
	mockDeleteGeofencesCommand,
	mockGetGeofenceCommand,
	mockListGeofencesCommand,
} from '../testUtils';
import {
	AmazonLocationServiceGeofence,
	Coordinates,
	SearchByCoordinatesOptions,
	SearchByTextOptions,
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
	if (command instanceof SearchPlaceIndexForSuggestionsCommand) {
		return {
			Results: [
				{
					Text: 'star',
					PlaceId: 'a1b2c3d4',
				},
				{
					Text: 'not star',
				},
			],
		};
	}
	if (command instanceof GetPlaceCommand) {
		return {
			Place: TestPlacePascalCase,
		};
	}
});

jest.mock('@aws-amplify/core', () => {
	const originalModule = jest.requireActual('@aws-amplify/core');

	return {
		...originalModule,
		fetchAuthSession: jest.fn(),
		Amplify: {
			getConfig: jest.fn(),
		},
	};
});

describe('AmazonLocationServiceProvider', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	beforeEach(() => {
		(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
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

	describe('get map resources', () => {
		test('should tell you if there are no available map resources', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const provider = new AmazonLocationServiceProvider();
			expect(() => provider.getAvailableMaps()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should get all available map resources', () => {
			const provider = new AmazonLocationServiceProvider(awsConfigGeoV4);

			const maps: any[] = [];
			const availableMaps = awsConfig.geo.amazon_location_service.maps.items;
			const { region } = awsConfig.geo.amazon_location_service;
			for (const mapName in availableMaps) {
				const { style } = availableMaps[mapName];
				maps.push({ mapName, style, region });
			}

			expect(provider.getAvailableMaps()).toEqual(maps);
		});

		test('should tell you if there is no map resources available when calling getDefaultMap', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const provider = new AmazonLocationServiceProvider();

			expect(() => provider.getDefaultMap()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should tell you if there is no default map resource', () => {
			const noDefaultMapConfig = {
				Geo: {
					LocationService: {
						maps: { items: [{ testMap: { style: 'teststyle' } }] },
					},
				},
			};
			(Amplify.getConfig as jest.Mock).mockReturnValue(noDefaultMapConfig);
			const provider = new AmazonLocationServiceProvider(
				noDefaultMapConfig as any,
			);

			expect(() => provider.getDefaultMap()).toThrow(
				"No default map resource found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should get the default map resource', () => {
			const provider = new AmazonLocationServiceProvider(awsConfigGeoV4);

			const mapName = awsConfig.geo.amazon_location_service.maps.default;
			const { style } =
				awsConfig.geo.amazon_location_service.maps.items[mapName];
			const { region } = awsConfig.geo.amazon_location_service;

			const testMap = { mapName, style, region };

			const defaultMapsResource = provider.getDefaultMap();
			expect(defaultMapsResource).toEqual(testMap);
		});
	});

	describe('searchByText', () => {
		const testString = 'star';

		test('should search with just text input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const results = await locationProvider.searchByText(testString);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should use biasPosition when given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
			};

			const results = await locationProvider.searchByText(
				testString,
				searchOptions,
			);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];

			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				BiasPosition: searchOptions.biasPosition,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should use searchAreaConstraints when given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				searchAreaConstraints: [123, 456, 789, 321],
			};

			const resultsWithConstraints = await locationProvider.searchByText(
				testString,
				searchOptions,
			);
			expect(resultsWithConstraints).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				FilterBBox: searchOptions.searchAreaConstraints,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should throw an error if both BiasPosition and SearchAreaConstraints are given in the options', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			await expect(
				locationProvider.searchByText(testString, searchOptions),
			).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object',
			);
		});

		test('should fail if credentials are invalid', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials: undefined });
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No credentials',
			);
		});

		test('should fail if _getCredentials fails ', async () => {
			(fetchAuthSession as jest.Mock).mockRejectedValueOnce('Auth Error');

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No credentials',
			);
		});

		test('should fail if there are no search index resources', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('searchForSuggestions', () => {
		const testString = 'star';
		const testResults = [
			{
				text: 'star',
				placeId: 'a1b2c3d4',
			},
			{
				text: 'not star',
			},
		];

		test('should search with just text input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const results = await locationProvider.searchForSuggestions(testString);

			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should use biasPosition when given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
			};

			const results = await locationProvider.searchForSuggestions(
				testString,
				searchOptions,
			);
			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];

			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				BiasPosition: searchOptions.biasPosition,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should use searchAreaConstraints when given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				searchAreaConstraints: [123, 456, 789, 321],
			};

			const resultsWithConstraints =
				await locationProvider.searchForSuggestions(testString, searchOptions);
			expect(resultsWithConstraints).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				FilterBBox: searchOptions.searchAreaConstraints,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should throw an error if both BiasPosition and SearchAreaConstraints are given in the options', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			await expect(
				locationProvider.searchForSuggestions(testString, searchOptions),
			).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object',
			);
		});

		test('should fail if credentials are invalid', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials: undefined });
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchForSuggestions(testString),
			).rejects.toThrow('No credentials');
		});

		test('should fail if _getCredentials fails ', async () => {
			(fetchAuthSession as jest.Mock).mockRejectedValueOnce('Auth Error');

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchForSuggestions(testString),
			).rejects.toThrow('No credentials');
		});

		test('should fail if there are no search index resources', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchForSuggestions(testString),
			).rejects.toThrow(
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('searchByPlaceId', () => {
		const testPlaceId = 'a1b2c3d4';
		const testResults = camelcaseKeys(TestPlacePascalCase, { deep: true });

		test('should search with PlaceId as input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const results = await locationProvider.searchByPlaceId(testPlaceId);

			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				PlaceId: testPlaceId,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should fail if PlaceId as input is empty string', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			await expect(locationProvider.searchByPlaceId('')).rejects.toThrow(
				'PlaceId cannot be an empty string.',
			);
		});

		test('should fail if credentials are invalid', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials: undefined });
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByPlaceId(testPlaceId),
			).rejects.toThrow('No credentials');
		});

		test('should fail if _getCredentials fails ', async () => {
			(fetchAuthSession as jest.Mock).mockRejectedValueOnce('Auth Error');

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByPlaceId(testPlaceId),
			).rejects.toThrow('No credentials');
		});

		test('should fail if there are no search index resources', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByPlaceId(testPlaceId),
			).rejects.toThrow(
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('searchByCoordinates', () => {
		const testCoordinates: Coordinates = [45, 90];

		test('should search with just text input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const results =
				await locationProvider.searchByCoordinates(testCoordinates);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should use options when given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const searchOptions: SearchByCoordinatesOptions = {
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await locationProvider.searchByCoordinates(
				testCoordinates,
				searchOptions,
			);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: searchOptions.searchIndexName,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should fail if credentials resolve to invalid', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials: undefined });
			});

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates),
			).rejects.toThrow('No credentials');
		});

		test('should fail if _getCredentials fails ', async () => {
			(fetchAuthSession as jest.Mock).mockRejectedValueOnce('Auth Error');

			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates),
			).rejects.toThrow('No credentials');
		});

		test('should fail if there are no search index resources', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates),
			).rejects.toThrow(
				'No Search Index found in amplify config, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('saveGeofences', () => {
		test('saveGeofences with multiple geofences', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const results = await locationProvider.saveGeofences(validGeofences);

			expect(results).toEqual(batchGeofencesCamelcaseResults);
		});

		test('saveGeofences calls batchPutGeofences in batches of 10 from input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const numberOfGeofences = 44;
			const input = createGeofenceInputArray(numberOfGeofences);

			const spyonProvider = jest.spyOn(locationProvider, 'saveGeofences');
			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');

			const results = await locationProvider.saveGeofences(input);

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

			const spyProviderInput = spyonProvider.mock.calls[0][0];

			const spyClientInput = spyonClient.mock.calls;

			expect(spyClientInput.length).toEqual(
				Math.ceil(spyProviderInput.length / 10),
			);
		});

		test('saveGeofences properly handles errors with bad network calls', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const input = createGeofenceInputArray(44);
			input[22].geofenceId = 'badId';
			const validEntries = [...input.slice(0, 20), ...input.slice(30, 44)];

			const spyonClient = jest.spyOn(LocationClient.prototype, 'send');
			spyonClient.mockImplementation(geofenceInput => {
				const entries = geofenceInput.input as any;

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
			});

			const results = await locationProvider.saveGeofences(input);
			const badResults = input.slice(20, 30).map(result => {
				return {
					error: {
						code: 'APIConnectionError',
						message: 'Bad network call',
					},
					geofenceId: result.geofenceId,
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

		test('should error if a geofence is wound clockwise', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			await expect(
				locationProvider.saveGeofences([clockwiseGeofence]),
			).rejects.toThrow(
				'geofenceWithClockwiseGeofence: LinearRing coordinates must be wound counterclockwise',
			);
		});

		test('should error if input is empty array', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			await expect(locationProvider.saveGeofences([])).rejects.toThrow(
				'Geofence input array is empty',
			);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			await expect(
				locationProvider.saveGeofences(validGeofences),
			).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('getGeofence', () => {
		test('getGeofence returns the right geofence', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockGetGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const results: AmazonLocationServiceGeofence =
				await locationProvider.getGeofence('geofenceId');

			const expected = {
				geofenceId: 'geofenceId',
				geometry: validGeometry,
				createTime: '2020-04-01T21:00:00.000Z',
				updateTime: '2020-04-01T21:00:00.000Z',
				status: 'ACTIVE',
			};

			expect(results).toEqual(expected);
		});

		test('getGeofence errors when a bad geofenceId is given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementationOnce(mockGetGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const badGeofenceId = 't|-|!$ !$ N()T V@|_!D';
			await expect(locationProvider.getGeofence(badGeofenceId)).rejects.toThrow(
				`Invalid geofenceId: '${badGeofenceId}' - IDs can only contain alphanumeric characters, hyphens, underscores and periods.`,
			);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			await expect(locationProvider.getGeofence('geofenceId')).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('listGeofences', () => {
		test('listGeofences gets the first 100 geofences when no arguments are given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockListGeofencesCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const geofences = await locationProvider.listGeofences();

			expect(geofences.entries.length).toEqual(100);
		});

		test('listGeofences gets the second 100 geofences when nextToken is passed', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockListGeofencesCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const first100Geofences = await locationProvider.listGeofences();

			const second100Geofences = await locationProvider.listGeofences({
				nextToken: first100Geofences.nextToken,
			});

			expect(second100Geofences.entries.length).toEqual(100);
			expect(second100Geofences.entries[0].geofenceId).toEqual(
				'validGeofenceId100',
			);
			expect(second100Geofences.entries[99].geofenceId).toEqual(
				'validGeofenceId199',
			);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			await expect(locationProvider.listGeofences()).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});

	describe('deleteGeofences', () => {
		test('deleteGeofences deletes given geofences successfully', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockDeleteGeofencesCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const geofenceIds = validGeofences.map(({ geofenceId }) => geofenceId);

			const results = await locationProvider.deleteGeofences(geofenceIds);

			const expected = {
				successes: geofenceIds,
				errors: [],
			};

			expect(results).toEqual(expected);
		});

		test('deleteGeofences calls batchDeleteGeofences in batches of 10 from input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

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
				Math.ceil(spyProviderInput.length / 10),
			);
		});

		test('deleteGeofences properly handles errors with bad network calls', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);

			const input = createGeofenceInputArray(44).map(
				({ geofenceId }) => geofenceId,
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

		test('should error if there is a bad geofence in the input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);
			await expect(
				locationProvider.deleteGeofences([
					'thisIsAGoodId',
					't|-|!$ !$ N()T V@|_!D',
					'#2 t|-|!$ !$ N()T V@|_!D',
				]),
			).rejects.toThrow(
				`Invalid geofence ids: t|-|!$ !$ N()T V@|_!D, #2 t|-|!$ !$ N()T V@|_!D`,
			);
		});

		test('should error if input array is empty', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const locationProvider = new AmazonLocationServiceProvider(
				awsConfigGeoV4,
			);
			await expect(locationProvider.deleteGeofences([])).rejects.toThrow(
				`GeofenceId input array is empty`,
			);
		});

		test('should error if there are no geofenceCollections in config', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const locationProvider = new AmazonLocationServiceProvider();

			const geofenceIds = validGeofences.map(({ geofenceId }) => geofenceId);

			await expect(
				locationProvider.deleteGeofences(geofenceIds),
			).rejects.toThrow(
				'No Geofence Collections found, please run `amplify add geo` to create one and run `amplify push` after.',
			);
		});
	});
});
