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

import { AmazonLocationServicesProvider } from '../../src/Providers/AmazonLocationServicesProvider';
import {
	credentials,
	awsConfig,
} from '../data';

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

			const config = geo.configure(awsConfig.geo);
			expect(config).toEqual(awsConfig.geo);
		});
	});

	describe('get map resources', () => {
		test('should tell you if there are no available map resources', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure();
			const availableMaps = provider.getAvailableMaps();
			expect(availableMaps).toEqual(
				"No map resources found, run 'amplify add geo' to create them"
			);
		});

		test('should get all available map resources', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure(awsConfig.geo);

			const maps = [];
			const availableMaps = awsConfig.geo.maps.items;
			for (const mapName in availableMaps) {
				const style = availableMaps[mapName].style;
				maps.push({ mapName, style });
			}

			expect(provider.getAvailableMaps()).toEqual(maps);
		});

		test('should tell you if there is no default map resource', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure();

			const defaultMapsResource = provider.getDefaultMap();

			expect(defaultMapsResource).toEqual(
				"No default map resource found, run 'amplify add geo' to create one"
			);
		});

		test('should get the default map resource', () => {
			const provider = new AmazonLocationServicesProvider();
			provider.configure(awsConfig.geo);

			const mapName = awsConfig.geo.maps.default;
			const style = awsConfig.geo.maps.items[mapName].style;
			const testMap = { mapName, style };

			const defaultMapsResource = provider.getDefaultMap();
			expect(defaultMapsResource).toEqual(testMap);
		});
	});
});
