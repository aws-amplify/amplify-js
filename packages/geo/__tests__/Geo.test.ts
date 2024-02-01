// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { fetchAuthSession, Amplify } from '@aws-amplify/core';
import {
	LocationClient,
	SearchPlaceIndexForTextCommand,
	SearchPlaceIndexForSuggestionsCommand,
	SearchPlaceIndexForPositionCommand,
	GetPlaceCommand,
} from '@aws-sdk/client-location';
import camelcaseKeys from 'camelcase-keys';

import { GeoClass } from '../src/Geo';
import { AmazonLocationServiceProvider } from '../src/providers/location-service/AmazonLocationServiceProvider';
import {
	AmazonLocationServiceMapStyle,
	Coordinates,
	SearchByCoordinatesOptions,
	SearchByTextOptions,
} from '../src/types';

import {
	credentials,
	awsConfig,
	TestPlacePascalCase,
	testPlaceCamelCase,
	validGeometry,
	validGeofences,
	validGeofence1,
	singleGeofenceCamelcaseResults,
	batchGeofencesCamelcaseResults,
	awsConfigGeoV4,
} from './testData';

import {
	mockBatchPutGeofenceCommand,
	mockGetGeofenceCommand,
	mockListGeofencesCommand,
} from './testUtils';

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

describe('Geo', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		test('happy case', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
		});
	});

	describe('getModuleName', () => {
		(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
		const geo = new GeoClass();
		const moduleName = geo.getModuleName();

		expect(moduleName).toBe('Geo');
	});

	describe('pluggables', () => {
		test('getPluggable', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			const provider = new AmazonLocationServiceProvider();
			geo.addPluggable(provider);

			expect(geo.getPluggable(provider.getProviderName())).toBeInstanceOf(
				AmazonLocationServiceProvider
			);
		});

		test('removePluggable', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			const provider = new AmazonLocationServiceProvider();
			geo.addPluggable(provider);
			geo.removePluggable(provider.getProviderName());

			expect(() => geo.getPluggable(provider.getProviderName())).toThrow(
				'No plugin found in Geo for the provider'
			);
		});
	});

	describe('AmazonLocationService is used as default provider', () => {
		test('creates the proper default provider', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			expect(geo.getPluggable('AmazonLocationService')).toBeInstanceOf(
				AmazonLocationServiceProvider
			);
		});
	});

	describe('get map resources', () => {
		test('should fail if there is no provider', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			geo.removePluggable('AmazonLocationService');

			expect(() => geo.getAvailableMaps()).toThrow(
				'No plugin found in Geo for the provider'
			);
			expect(() => geo.getDefaultMap()).toThrow(
				'No plugin found in Geo for the provider'
			);
		});

		test('should tell you if there are no available map resources', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const geo = new GeoClass();

			expect(() => geo.getAvailableMaps()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should get all available map resources', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const maps: AmazonLocationServiceMapStyle[] = [];
			const availableMaps = awsConfig.geo.amazon_location_service.maps.items;
			const region = awsConfig.geo.amazon_location_service.region;

			for (const mapName in availableMaps) {
				const style = availableMaps[mapName].style;
				maps.push({ mapName, style, region });
			}

			expect(geo.getAvailableMaps()).toEqual(maps);
		});

		test('should fail gracefully if no config is found', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue({});
			const geo = new GeoClass();

			expect(() => geo.getDefaultMap()).toThrow(
				"No Geo configuration found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should tell you if there is no map resources when running getDefaultMap', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: { LocationService: {} },
			});
			const geo = new GeoClass();

			expect(() => geo.getDefaultMap()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should tell you if there is no default map resources (but there are maps) when running getDefaultMap', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue({
				Geo: {
					LocationService: {
						maps: { items: { testMap: { style: 'teststyle' } } },
					},
				},
			} as any);
			const geo = new GeoClass();

			expect(() => geo.getDefaultMap()).toThrow(
				"No default map resource found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should get the default map resource', () => {
			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const mapName = awsConfig.geo.amazon_location_service.maps.default;
			const style =
				awsConfig.geo.amazon_location_service.maps.items[mapName].style;
			const region = awsConfig.geo.amazon_location_service.region;
			const testMap = { mapName, style, region };

			const defaultMapsResource = geo.getDefaultMap();
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
			const geo = new GeoClass();

			const results = await geo.searchByText(testString);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.searchIndices.default,
			});
		});

		test('should search using given options with biasPosition', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByTextOptions = {
				biasPosition: [12345, 67890],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				language: 'en',
			};
			const results = await geo.searchByText(testString, searchOptions);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: searchOptions.searchIndexName,
				BiasPosition: searchOptions.biasPosition,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
				Language: searchOptions.language,
			});
		});

		test('should search using given options with searchAreaConstraints', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByTextOptions = {
				searchAreaConstraints: [123, 456, 789, 321],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchByText(testString, searchOptions);
			expect(results).toEqual([testPlaceCamelCase]);

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

		test('should throw an error if both BiasPosition and SearchAreaConstraints are given in the options', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			await expect(geo.searchByText(testString, searchOptions)).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object'
			);
		});

		test('should fail if there is no provider', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByText(testString)).rejects.toThrow(
				'No plugin found in Geo for the provider'
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
			const geo = new GeoClass();

			const results = await geo.searchByPlaceId(testPlaceId);
			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				PlaceId: testPlaceId,
				IndexName: awsConfig.geo.amazon_location_service.searchIndices.default,
			});
		});

		test('should fail if there is no provider', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByPlaceId(testPlaceId)).rejects.toThrow(
				'No plugin found in Geo for the provider'
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
			const geo = new GeoClass();

			const results = await geo.searchForSuggestions(testString);
			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.searchIndices.default,
			});
		});

		test('should search using given options with biasPosition', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByTextOptions = {
				biasPosition: [12345, 67890],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchForSuggestions(testString, searchOptions);
			expect(results).toEqual(testResults);

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

		test('should search using given options with searchAreaConstraints', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByTextOptions = {
				searchAreaConstraints: [123, 456, 789, 321],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchForSuggestions(testString, searchOptions);
			expect(results).toEqual(testResults);

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

		test('should throw an error if both BiasPosition and SearchAreaConstraints are given in the options', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			await expect(
				geo.searchForSuggestions(testString, searchOptions)
			).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object'
			);
		});

		test('should fail if there is no provider', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchForSuggestions(testString)).rejects.toThrow(
				'No plugin found in Geo for the provider'
			);
		});
	});

	describe('searchByCoordinates', () => {
		const testCoordinates: Coordinates = [45, 90];

		test('should search with just coordinate input', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const results = await geo.searchByCoordinates(testCoordinates);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: awsConfig.geo.amazon_location_service.searchIndices.default,
			});
		});

		test('should search using options when given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			const searchOptions: SearchByCoordinatesOptions = {
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchByCoordinates(
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

		test('should fail if there is no provider', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByCoordinates(testCoordinates)).rejects.toThrow(
				'No plugin found in Geo for the provider'
			);
		});
	});

	describe('saveGeofences', () => {
		test('saveGeofences with a single geofence', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementationOnce(mockBatchPutGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			// Check that results are what's expected
			const results = await geo.saveGeofences(validGeofence1);
			expect(results).toEqual(singleGeofenceCamelcaseResults);

			// Expect that the API was called with the proper input
			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			const output = {
				Entries: [
					{
						GeofenceId: validGeofence1.geofenceId,
						Geometry: {
							Polygon: validGeofence1.geometry.polygon,
						},
					},
				],
				CollectionName: 'geofenceCollectionExample',
			};
			expect(input).toEqual(output);
		});

		test('saveGeofences with multiple geofences', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			// Check that results are what's expected
			const results = await geo.saveGeofences(validGeofences);
			expect(results).toEqual(batchGeofencesCamelcaseResults);

			// Expect that the API was called the right amount of times
			const expectedNumberOfCalls = Math.floor(validGeofences.length / 10) + 1;
			expect(LocationClient.prototype.send).toHaveBeenCalledTimes(
				expectedNumberOfCalls
			);
		});

		test('should fail if there is no provider', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();
			geo.removePluggable('AmazonLocationService');

			await expect(geo.saveGeofences(validGeofence1)).rejects.toThrow(
				'No plugin found in Geo for the provider'
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
				.mockImplementationOnce(mockGetGeofenceCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			// Check that results are what's expected
			const results = await geo.getGeofence('testGeofenceId');
			const expected = {
				geofenceId: 'testGeofenceId',
				geometry: validGeometry,
				createTime: '2020-04-01T21:00:00.000Z',
				updateTime: '2020-04-01T21:00:00.000Z',
				status: 'ACTIVE',
			};
			expect(results).toEqual(expected);

			// Expect that the API was called with the proper input
			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			const output = {
				GeofenceId: 'testGeofenceId',
				CollectionName: 'geofenceCollectionExample',
			};
			expect(input).toEqual(output);
		});
	});

	describe('listGeofences', () => {
		test('listGeofences gets the first 100 geofences when no arguments are given', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementationOnce(mockListGeofencesCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			// Check that results are what's expected
			const results = await geo.listGeofences();
			expect(results.entries.length).toEqual(100);
		});

		test('listGeofences gets the second 100 geofences when nextToken is passed', async () => {
			(fetchAuthSession as jest.Mock).mockImplementationOnce(() => {
				return Promise.resolve({ credentials });
			});

			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockListGeofencesCommand);

			(Amplify.getConfig as jest.Mock).mockReturnValue(awsConfigGeoV4);
			const geo = new GeoClass();

			// Check that results are what's expected

			const first100Geofences = await geo.listGeofences();

			const second100Geofences = await geo.listGeofences({
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
	});
});
