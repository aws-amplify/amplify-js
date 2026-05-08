// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	GetPlaceCommand,
	LocationClient,
	SearchPlaceIndexForPositionCommand,
	SearchPlaceIndexForSuggestionsCommand,
	SearchPlaceIndexForTextCommand,
} from '@aws-sdk/client-location';
import camelcaseKeys from 'camelcase-keys';

import { GeoClass } from '../src/Geo';
import { AmazonLocationServiceProvider } from '../src/providers/location-service/AmazonLocationServiceProvider';
import {
	AmazonLocationServiceMapStyle,
	Coordinates,
	Geofence,
	Place,
	SaveGeofencesResults,
	SearchByCoordinatesOptions,
	SearchByTextOptions,
} from '../src/types';

import {
	TestPlacePascalCase,
	awsConfig,
	awsConfigGeoV4,
	batchGeofencesCamelcaseResults,
	singleGeofenceCamelcaseResults,
	testPlaceCamelCase,
	validGeofence1,
	validGeofences,
	validGeometry,
} from './testData';
import {
	createMockAmplifyContext,
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

describe('Geo', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	describe('getModuleName', () => {
		const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
		const geo = new GeoClass(mockCtx);
		const moduleName = geo.getModuleName();

		expect(moduleName).toBe('Geo');
	});

	describe('pluggables', () => {
		test('getPluggable', () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			const provider = new AmazonLocationServiceProvider(mockCtx);
			geo.addPluggable(provider);

			expect(geo.getPluggable(provider.getProviderName())).toBeInstanceOf(
				AmazonLocationServiceProvider,
			);
		});

		test('removePluggable', () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			const provider = new AmazonLocationServiceProvider(mockCtx);
			geo.addPluggable(provider);
			geo.removePluggable(provider.getProviderName());

			expect(() => geo.getPluggable(provider.getProviderName())).toThrow(
				'No plugin found in Geo for the provider',
			);
		});
	});

	describe('AmazonLocationService is used as default provider', () => {
		test('creates the proper default provider', () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			expect(geo.getPluggable('AmazonLocationService')).toBeInstanceOf(
				AmazonLocationServiceProvider,
			);
		});
	});

	describe('get map resources', () => {
		test('should fail if there is no provider', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			geo.removePluggable('AmazonLocationService');

			expect(() => geo.getAvailableMaps()).toThrow(
				'No plugin found in Geo for the provider',
			);
			expect(() => geo.getDefaultMap()).toThrow(
				'No plugin found in Geo for the provider',
			);
		});

		test('should tell you if there are no available map resources', () => {
			const mockCtx = createMockAmplifyContext({
				Geo: { LocationService: {} },
			});
			const geo = new GeoClass(mockCtx);

			expect(() => geo.getAvailableMaps()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should get all available map resources', () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const maps: AmazonLocationServiceMapStyle[] = [];
			const availableMaps = awsConfig.geo.amazon_location_service.maps.items;
			const { region } = awsConfig.geo.amazon_location_service;

			for (const mapName in availableMaps) {
				const { style } = availableMaps[mapName];
				maps.push({ mapName, style, region });
			}

			expect(geo.getAvailableMaps()).toEqual(maps);
		});

		test('should fail gracefully if no config is found', () => {
			const mockCtx = createMockAmplifyContext({});
			const geo = new GeoClass(mockCtx);

			expect(() => geo.getDefaultMap()).toThrow(
				"No Geo configuration found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should tell you if there is no map resources when running getDefaultMap', () => {
			const mockCtx = createMockAmplifyContext({
				Geo: { LocationService: {} },
			});
			const geo = new GeoClass(mockCtx);

			expect(() => geo.getDefaultMap()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should tell you if there is no default map resources (but there are maps) when running getDefaultMap', () => {
			const mockCtx = createMockAmplifyContext({
				Geo: {
					LocationService: {
						maps: { items: { testMap: { style: 'teststyle' } } },
					},
				},
			} as any);
			const geo = new GeoClass(mockCtx);

			expect(() => geo.getDefaultMap()).toThrow(
				"No default map resource found in amplify config, run 'amplify add geo' to create one and run `amplify push` after",
			);
		});

		test('should get the default map resource', () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const mapName = awsConfig.geo.amazon_location_service.maps.default;
			const { style } =
				awsConfig.geo.amazon_location_service.maps.items[mapName];
			const { region } = awsConfig.geo.amazon_location_service;
			const testMap = { mapName, style, region };

			const defaultMapsResource = geo.getDefaultMap();
			expect(defaultMapsResource).toEqual(testMap);
		});
	});

	describe('searchByText', () => {
		const testString = 'star';

		test('should search with just text input', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const results = await geo.searchByText(testString);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should search using given options with biasPosition', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

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
			const { input } = spyon.mock.calls[0][0];
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
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const searchOptions: SearchByTextOptions = {
				searchAreaConstraints: [123, 456, 789, 321],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchByText(testString, searchOptions);
			expect(results).toEqual([testPlaceCamelCase]);

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
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			await expect(geo.searchByText(testString, searchOptions)).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object',
			);
		});

		test('should fail if there is no provider', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByText(testString)).rejects.toThrow(
				'No plugin found in Geo for the provider',
			);
		});
	});

	describe('searchByPlaceId', () => {
		const testPlaceId = 'a1b2c3d4';
		const testResults = camelcaseKeys(TestPlacePascalCase, { deep: true });

		test('should search with PlaceId as input', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const results = await geo.searchByPlaceId(testPlaceId);
			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				PlaceId: testPlaceId,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should fail if there is no provider', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByPlaceId(testPlaceId)).rejects.toThrow(
				'No plugin found in Geo for the provider',
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
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const results = await geo.searchForSuggestions(testString);
			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should search using given options with biasPosition', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const searchOptions: SearchByTextOptions = {
				biasPosition: [12345, 67890],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchForSuggestions(testString, searchOptions);
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

		test('should search using given options with searchAreaConstraints', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const searchOptions: SearchByTextOptions = {
				searchAreaConstraints: [123, 456, 789, 321],
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchForSuggestions(testString, searchOptions);
			expect(results).toEqual(testResults);

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
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			await expect(
				geo.searchForSuggestions(testString, searchOptions),
			).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object',
			);
		});

		test('should fail if there is no provider', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchForSuggestions(testString)).rejects.toThrow(
				'No plugin found in Geo for the provider',
			);
		});
	});

	describe('searchByCoordinates', () => {
		const testCoordinates: Coordinates = [45, 90];

		test('should search with just coordinate input', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const results = await geo.searchByCoordinates(testCoordinates);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should search using options when given', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			const searchOptions: SearchByCoordinatesOptions = {
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
			};
			const results = await geo.searchByCoordinates(
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

		test('should fail if there is no provider', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByCoordinates(testCoordinates)).rejects.toThrow(
				'No plugin found in Geo for the provider',
			);
		});
	});

	describe('saveGeofences', () => {
		test('saveGeofences with a single geofence', async () => {
			LocationClient.prototype.send = jest
				.fn()
				.mockImplementationOnce(mockBatchPutGeofenceCommand);

			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			// Check that results are what's expected
			const results = await geo.saveGeofences(validGeofence1);
			expect(results).toEqual(singleGeofenceCamelcaseResults);

			// Expect that the API was called with the proper input
			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const { input } = spyon.mock.calls[0][0];
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
			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockBatchPutGeofenceCommand);

			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			// Check that results are what's expected
			const results = await geo.saveGeofences(validGeofences);
			expect(results).toEqual(batchGeofencesCamelcaseResults);

			// Expect that the API was called the right amount of times
			const expectedNumberOfCalls = Math.floor(validGeofences.length / 10) + 1;
			expect(LocationClient.prototype.send).toHaveBeenCalledTimes(
				expectedNumberOfCalls,
			);
		});

		test('should fail if there is no provider', async () => {
			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.saveGeofences(validGeofence1)).rejects.toThrow(
				'No plugin found in Geo for the provider',
			);
		});
	});

	describe('getGeofence', () => {
		test('getGeofence returns the right geofence', async () => {
			LocationClient.prototype.send = jest
				.fn()
				.mockImplementationOnce(mockGetGeofenceCommand);

			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

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
			const { input } = spyon.mock.calls[0][0];
			const output = {
				GeofenceId: 'testGeofenceId',
				CollectionName: 'geofenceCollectionExample',
			};
			expect(input).toEqual(output);
		});
	});

	describe('listGeofences', () => {
		test('listGeofences gets the first 100 geofences when no arguments are given', async () => {
			LocationClient.prototype.send = jest
				.fn()
				.mockImplementationOnce(mockListGeofencesCommand);

			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			// Check that results are what's expected
			const results = await geo.listGeofences();
			expect(results.entries.length).toEqual(100);
		});

		test('listGeofences gets the second 100 geofences when nextToken is passed', async () => {
			LocationClient.prototype.send = jest
				.fn()
				.mockImplementation(mockListGeofencesCommand);

			const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
			const geo = new GeoClass(mockCtx);

			// Check that results are what's expected

			const first100Geofences = await geo.listGeofences();

			const second100Geofences = await geo.listGeofences({
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
	});
});

describe('GeoClass static methods', () => {
	const mockCtx = createMockAmplifyContext(awsConfigGeoV4);

	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	test('searchByText delegates to instance method', async () => {
		const expected = [testPlaceCamelCase] as unknown as Place[];
		const spy = jest
			.spyOn(GeoClass.prototype, 'searchByText')
			.mockResolvedValue(expected);
		const result = await GeoClass.searchByText(mockCtx, 'star');
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith('star', undefined);
	});

	test('searchForSuggestions delegates to instance method', async () => {
		const expected = [{ text: 'star', placeId: 'a1b2c3d4' }];
		const spy = jest
			.spyOn(GeoClass.prototype, 'searchForSuggestions')
			.mockResolvedValue(expected);
		const result = await GeoClass.searchForSuggestions(mockCtx, 'star');
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith('star', undefined);
	});

	test('searchByPlaceId delegates to instance method', async () => {
		const expected = testPlaceCamelCase as unknown as Place;
		const spy = jest
			.spyOn(GeoClass.prototype, 'searchByPlaceId')
			.mockResolvedValue(expected);
		const result = await GeoClass.searchByPlaceId(mockCtx, 'a1b2c3d4');
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith('a1b2c3d4', undefined);
	});

	test('searchByCoordinates delegates to instance method', async () => {
		const coords: Coordinates = [45, 90];
		const expected = testPlaceCamelCase as unknown as Place;
		const spy = jest
			.spyOn(GeoClass.prototype, 'searchByCoordinates')
			.mockResolvedValue(expected);
		const result = await GeoClass.searchByCoordinates(mockCtx, coords);
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith(coords, undefined);
	});

	test('getAvailableMaps delegates to instance method', () => {
		const expected = [
			{
				mapName: 'geoJsExampleMap1',
				style: 'VectorEsriStreets',
				region: 'us-west-2',
			},
		];
		const spy = jest
			.spyOn(GeoClass.prototype, 'getAvailableMaps')
			.mockReturnValue(expected);
		const result = GeoClass.getAvailableMaps(mockCtx);
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith(undefined);
	});

	test('getDefaultMap delegates to instance method', () => {
		const expected = {
			mapName: 'geoJsExampleMap1',
			style: 'VectorEsriStreets',
			region: 'us-west-2',
		};
		const spy = jest
			.spyOn(GeoClass.prototype, 'getDefaultMap')
			.mockReturnValue(expected);
		const result = GeoClass.getDefaultMap(mockCtx);
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith(undefined);
	});

	test('saveGeofences delegates to instance method', async () => {
		const expected =
			singleGeofenceCamelcaseResults as unknown as SaveGeofencesResults;
		const spy = jest
			.spyOn(GeoClass.prototype, 'saveGeofences')
			.mockResolvedValue(expected);
		const result = await GeoClass.saveGeofences(mockCtx, validGeofence1);
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith(validGeofence1, undefined);
	});

	test('getGeofence delegates to instance method', async () => {
		const expected = {
			geofenceId: 'testId',
			geometry: validGeometry,
			createTime: '2020-04-01T21:00:00.000Z',
			updateTime: '2020-04-01T21:00:00.000Z',
			status: 'ACTIVE',
		} as unknown as Geofence;
		const spy = jest
			.spyOn(GeoClass.prototype, 'getGeofence')
			.mockResolvedValue(expected);
		const result = await GeoClass.getGeofence(mockCtx, 'testId');
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith('testId', undefined);
	});

	test('listGeofences delegates to instance method', async () => {
		const expected = { entries: [], nextToken: undefined };
		const spy = jest
			.spyOn(GeoClass.prototype, 'listGeofences')
			.mockResolvedValue(expected);
		const result = await GeoClass.listGeofences(mockCtx);
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith(undefined);
	});

	test('deleteGeofences delegates to instance method', async () => {
		const expected = { successes: ['id1'], errors: [] };
		const spy = jest
			.spyOn(GeoClass.prototype, 'deleteGeofences')
			.mockResolvedValue(expected);
		const result = await GeoClass.deleteGeofences(mockCtx, ['id1']);
		expect(result).toEqual(expected);
		expect(spy).toHaveBeenCalledWith(['id1'], undefined);
	});

	test('static methods pass options through', async () => {
		const spy = jest
			.spyOn(GeoClass.prototype, 'searchByText')
			.mockResolvedValue([]);
		const opts: SearchByTextOptions = { maxResults: 5 };
		await GeoClass.searchByText(mockCtx, 'test', opts);
		expect(spy).toHaveBeenCalledWith('test', opts);
	});
});

describe('GeoClass instance deleteGeofences', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	test('deleteGeofences calls provider', async () => {
		LocationClient.prototype.send = jest.fn().mockResolvedValue({
			Errors: [],
		});

		const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
		const geo = new GeoClass(mockCtx);

		const result = await geo.deleteGeofences(['testId']);
		expect(result.successes).toContain('testId');
	});

	test('deleteGeofences should fail if there is no provider', async () => {
		const mockCtx = createMockAmplifyContext(awsConfigGeoV4);
		const geo = new GeoClass(mockCtx);
		geo.removePluggable('AmazonLocationService');

		await expect(geo.deleteGeofences(['testId'])).rejects.toThrow(
			'No plugin found in Geo for the provider',
		);
	});
});
