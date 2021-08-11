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
	LocationClient,
	SearchPlaceIndexForTextCommand,
	SearchPlaceIndexForPositionCommand,
} from '@aws-sdk/client-location';

import { AmazonLocationServicesProvider } from '../../src/Providers/AmazonLocationServicesProvider';
import {
	credentials,
	awsConfig,
	TestPlacePascalCase,
	testPlaceCamelCase,
} from '../data';
import {
	SearchByTextOptions,
	SearchByCoordinatesOptions,
	Coordinates,
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

describe('AmazonLocationServicesProvider', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		test('happy case', () => {
			const provider = new AmazonLocationServicesProvider();
		});
	});

	describe('getCategory', () => {
		test('should return "Geo" when asked for category', () => {
			const geo = new AmazonLocationServicesProvider();
			expect(geo.getCategory()).toBe('Geo');
		});
	});

	describe('getProviderName', () => {
		test('should return "AmazonLocationServices" when asked for Provider', () => {
			const geo = new AmazonLocationServicesProvider();
			expect(geo.getProviderName()).toBe('AmazonLocationServices');
		});
	});

	describe('configure', () => {
		test('should return a blank config object when none is passed in', () => {
			const geo = new AmazonLocationServicesProvider();
			const config = geo.configure();
			expect(config).toEqual({});
		});

		test('should return standard configuration given when passing to `geo.configure`', () => {
			const geo = new AmazonLocationServicesProvider();

			const config = geo.configure(awsConfig.geo.amazon_location_services);
			expect(config).toEqual(awsConfig.geo.amazon_location_services);
		});
	});

	describe('get map resources', () => {
		test('should tell you if there are no available map resources', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure();
			expect(() => provider.getAvailableMaps()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create them and ensure to run `amplify push` after"
			);
		});

		test('should get all available map resources', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure(awsConfig.geo.amazon_location_services);

			const maps = [];
			const availableMaps = awsConfig.geo.amazon_location_services.maps.items;
			const region = awsConfig.geo.amazon_location_services.region;
			for (const mapName in availableMaps) {
				const style = availableMaps[mapName].style;
				maps.push({ mapName, style, region });
			}

			expect(provider.getAvailableMaps()).toEqual(maps);
		});

		test('should tell you if there is no map resources available when calling getDefaultMap', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure();

			expect(() => provider.getDefaultMap()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create them and ensure to run `amplify push` after"
			);
		});

		test('should tell you if there is no default map resource', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure({
				maps: { testMap: { style: 'teststyle' } },
			});

			expect(() => provider.getDefaultMap()).toThrow(
				"No default map resource found in amplify config, run 'amplify add geo' to create one and ensure to run `amplify push` after"
			);
		});

		test('should get the default map resource', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure(awsConfig.geo.amazon_location_services);

			const mapName = awsConfig.geo.amazon_location_services.maps.default;
			const style =
				awsConfig.geo.amazon_location_services.maps.items[mapName].style;
			const region = awsConfig.geo.amazon_location_services.region;

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

			const locationProvider = new AmazonLocationServicesProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_services);

			const results = await locationProvider.searchByText(testString);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName:
					awsConfig.geo.amazon_location_services.search_indices.default,
			});
		});

		test('should use biasPosition when given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServicesProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_services);

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

			const locationProvider = new AmazonLocationServicesProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_services);

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

			const locationProvider = new AmazonLocationServicesProvider();

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No credentials'
			);
		});

		test('should fail if _getCredentials fails ', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.reject();
			});

			const locationProvider = new AmazonLocationServicesProvider();

			await expect(locationProvider.searchByText(testString)).rejects.toThrow(
				'No credentials'
			);
		});
	});

	describe('searchByCoordinates', () => {
		const testCoordinates: Coordinates = [12345, 67890];

		test('should search with just text input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServicesProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_services);

			const results = await locationProvider.searchByCoordinates(
				testCoordinates
			);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName:
					awsConfig.geo.amazon_location_services.search_indices.default,
			});
		});

		test('should use options when given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const locationProvider = new AmazonLocationServicesProvider();
			locationProvider.configure(awsConfig.geo.amazon_location_services);

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

			const locationProvider = new AmazonLocationServicesProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates)
			).rejects.toThrow('No credentials');
		});

		test('should fail if _getCredentials fails ', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.reject();
			});

			const locationProvider = new AmazonLocationServicesProvider();

			await expect(
				locationProvider.searchByCoordinates(testCoordinates)
			).rejects.toThrow('No credentials');
		});
	});
});
