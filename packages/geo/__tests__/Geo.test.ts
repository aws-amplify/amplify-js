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
	SearchPlaceIndexForSuggestionsCommand,
	SearchPlaceIndexForPositionCommand,
} from '@aws-sdk/client-location';

import { GeoClass } from '../src/Geo';
import { AmazonLocationServiceProvider } from '../src/Providers/AmazonLocationServiceProvider';
import {
	Coordinates,
	SearchByCoordinatesOptions,
	SearchByTextOptions,
} from '../src/types';

import {
	credentials,
	awsConfig,
	TestPlacePascalCase,
	testPlaceCamelCase,
} from './data';

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
					Text: 'starbucks',
				},
				{
					Text: 'not starbucks',
				},
			],
		};
	}
});

describe('Geo', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		test('happy case', () => {
			const geo = new GeoClass();
		});
	});

	describe('getModuleName', () => {
		const geo = new GeoClass();
		const moduleName = geo.getModuleName();

		expect(moduleName).toBe('Geo');
	});

	describe('pluggables', () => {
		test('getPluggable', () => {
			const geo = new GeoClass();
			const provider = new AmazonLocationServiceProvider();
			geo.addPluggable(provider);

			expect(geo.getPluggable(provider.getProviderName())).toBeInstanceOf(
				AmazonLocationServiceProvider
			);
		});

		test('removePluggable', () => {
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
			const geo = new GeoClass();
			geo.configure(awsConfig);
			expect(geo.getPluggable('AmazonLocationService')).toBeInstanceOf(
				AmazonLocationServiceProvider
			);
		});
	});

	describe('configure', () => {
		test('configure with aws-exports file', () => {
			const geo = new GeoClass();
			const config = geo.configure(awsConfig);
			const expected = {
				...awsConfig,
				AmazonLocationService: awsConfig.geo.amazon_location_service,
			};
			expect(config).toEqual(expected);
		});
	});

	describe('get map resources', () => {
		test('should fail if there is no provider', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);
			geo.removePluggable('AmazonLocationService');

			expect(() => geo.getAvailableMaps()).toThrow(
				'No plugin found in Geo for the provider'
			);
			expect(() => geo.getDefaultMap()).toThrow(
				'No plugin found in Geo for the provider'
			);
		});

		test('should tell you if there are no available map resources', () => {
			const geo = new GeoClass();
			geo.configure({});

			expect(() => geo.getAvailableMaps()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create them and run `amplify push` after"
			);
		});

		test('should get all available map resources', () => {
			const geo = new GeoClass();
			geo.configure(awsConfig);

			const maps = [];
			const availableMaps = awsConfig.geo.amazon_location_service.maps.items;
			const region = awsConfig.geo.amazon_location_service.region;

			for (const mapName in availableMaps) {
				const style = availableMaps[mapName].style;
				maps.push({ mapName, style, region });
			}

			expect(geo.getAvailableMaps()).toEqual(maps);
		});

		test('should tell you if there is no map resources when running getDefaultMap', () => {
			const geo = new GeoClass();
			geo.configure({});

			expect(() => geo.getDefaultMap()).toThrow(
				"No map resources found in amplify config, run 'amplify add geo' to create them and run `amplify push` after"
			);
		});

		test('should tell you if there is no default map resources (but there are maps) when running getDefaultMap', () => {
			const geo = new GeoClass();
			geo.configure({
				geo: {
					amazon_location_service: {
						maps: { items: { testMap: { style: 'teststyle' } } },
					},
				},
			});

			expect(() => geo.getDefaultMap()).toThrow(
				"No default map resource found in amplify config, run 'amplify add geo' to create one and run `amplify push` after"
			);
		});

		test('should get the default map resource', () => {
			const geo = new GeoClass();
			geo.configure(awsConfig);

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
		const testString = 'starbucks';

		test('should search with just text input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

			const results = await geo.searchByText(testString);
			expect(results).toEqual([testPlaceCamelCase]);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should search using given options with biasPosition', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

			const searchOptions: SearchByTextOptions = {
				biasPosition: [12345, 67890],
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
				BiasPosition: searchOptions.biasPosition,
				FilterCountries: searchOptions.countries,
				MaxResults: searchOptions.maxResults,
			});
		});

		test('should search using given options with searchAreaConstraints', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByText(testString)).rejects.toThrow(
				'No plugin found in Geo for the provider'
			);
		});
	});

	describe('searchForSuggestions', () => {
		const testString = 'starbucks';
		const testResults = ['starbucks', 'not starbucks'];

		test('should search with just text input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

			const results = await geo.searchForSuggestions(testString);
			expect(results).toEqual(testResults);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Text: testString,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should search using given options with biasPosition', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

			const searchOptions: SearchByTextOptions = {
				countries: ['USA'],
				maxResults: 40,
				searchIndexName: 'geoJSSearchCustomExample',
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};

			const resultsWithConstraints = await geo.searchForSuggestions(
				testString,
				searchOptions
			);
			expect(resultsWithConstraints).rejects.toThrow(
				'BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object'
			);
		});

		test('should fail if there is no provider', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchForSuggestions(testString)).rejects.toThrow(
				'No plugin found in Geo for the provider'
			);
		});
	});

	describe('searchByCoordinates', () => {
		const testCoordinates: Coordinates = [12345, 67890];

		test('should search with just coordinate input', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

			const results = await geo.searchByCoordinates(testCoordinates);
			expect(results).toEqual(testPlaceCamelCase);

			const spyon = jest.spyOn(LocationClient.prototype, 'send');
			const input = spyon.mock.calls[0][0].input;
			expect(input).toEqual({
				Position: testCoordinates,
				IndexName: awsConfig.geo.amazon_location_service.search_indices.default,
			});
		});

		test('should search using options when given', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);

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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const geo = new GeoClass();
			geo.configure(awsConfig);
			geo.removePluggable('AmazonLocationService');

			await expect(geo.searchByCoordinates(testCoordinates)).rejects.toThrow(
				'No plugin found in Geo for the provider'
			);
		});
	});
});
