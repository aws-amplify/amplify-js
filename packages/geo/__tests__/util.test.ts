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

import { validateCoordinates } from '../src/util';

describe('validateCoordinates', () => {
	test('should return true for valid coordinates', () => {
		const validCoordinates = [
			{ lat: 0, lng: 0 },
			{ lat: -90, lng: -180 },
			{ lat: 90, lng: 180 },
			{ lat: -90, lng: 180 },
			{ lat: 90, lng: -180 },
		];
		validCoordinates.forEach(({ lat, lng }) => {
			expect(validateCoordinates(lng, lat)).toBe(true);
		});
	});

	test('should error with message for bad latitude', () => {
		const invalidCoordinates = [
			{ lat: -91, lng: 0 },
			{ lat: 91, lng: 0 },
		];
		invalidCoordinates.forEach(({ lat, lng }) => {
			expect(() => validateCoordinates(lng, lat)).toThrowError(
				'Latitude must be between -90 and 90 degrees inclusive.'
			);
		});
	});

	test('should error with message for bad longitude', () => {
		const invalidCoordinates = [
			{ lat: 0, lng: -181 },
			{ lat: 0, lng: 181 },
		];
		invalidCoordinates.forEach(({ lat, lng }) => {
			expect(() => validateCoordinates(lng, lat)).toThrowError(
				'Longitude must be between -180 and 180 degrees inclusive.'
			);
		});
	});

	test('should error with message for coordinates with infinity', () => {
		const invalidCoordinates = [
			{ lat: Infinity, lng: 0 },
			{ lat: 0, lng: Infinity },
			{ lat: -Infinity, lng: 0 },
			{ lat: 0, lng: -Infinity },
		];
		invalidCoordinates.forEach(({ lat, lng }) => {
			expect(() => validateCoordinates(lng, lat)).toThrowError(
				`Invalid coordinates: [${lng},${lat}]`
			);
		});
	});
});
