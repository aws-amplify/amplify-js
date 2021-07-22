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
});
