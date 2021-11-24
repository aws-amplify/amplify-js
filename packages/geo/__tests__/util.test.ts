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

import {
	validateCoordinates,
	validateLinearRing,
	validatePolygon,
	validateGeofences,
} from '../src/util';

import {
	invalidLngCoordinates,
	invalidLatCoordinates,
	infiniteCoordinates,
	validLinearRing,
	linearRingIncomplete,
	linearRingTooSmall,
	linearRingBadCoordinates,
	validPolygon,
	polygonTooBig,
	validGeofences,
	geofencesWithDuplicate,
	geofencesWithInvalidId,
} from './data';

describe('validateCoordinates', () => {
	test('should return true for valid coordinates', () => {
		validLinearRing.forEach(([lng, lat]) => {
			expect(validateCoordinates(lng, lat)).toBeTruthy();
		});
	});

	test('should error with message for bad longitude', () => {
		invalidLngCoordinates.forEach(([lng, lat]) => {
			expect(() => validateCoordinates(lng, lat)).toThrowError(
				'Longitude must be between -180 and 180 degrees inclusive.'
			);
		});
	});

	test('should error with message for bad latitude', () => {
		invalidLatCoordinates.forEach(([lng, lat]) => {
			expect(() => validateCoordinates(lng, lat)).toThrowError(
				'Latitude must be between -90 and 90 degrees inclusive.'
			);
		});
	});

	test('should error with message for coordinates with infinity', () => {
		infiniteCoordinates.forEach(([lng, lat]) => {
			expect(() => validateCoordinates(lng, lat)).toThrowError(
				`Invalid coordinates: [${lng},${lat}]`
			);
		});
	});
});

describe('validateLinearRing', () => {
	test('should return true for a valid LinearRing', () => {
		const result = validateLinearRing(validLinearRing);
		expect(result).toBeTruthy();
	});
	test('should error if first and last coordinates do not match', () => {
		expect(() => validateLinearRing(linearRingIncomplete)).toThrowError(
			`LinearRing's first and last coordinates are not the same`
		);
	});
	test('should error if LinearRing has less than 4 elements', () => {
		expect(() => validateLinearRing(linearRingTooSmall)).toThrowError(
			'LinearRing must contain 4 or more coordinates.'
		);
	});
	test('should error if any coordinates are not valid', () => {
		expect(() => validateLinearRing(linearRingBadCoordinates)).toThrowError(
			'One or more of the coordinates are not valid'
		);
	});
});

describe('validatePolygon', () => {
	test('should return true for a valid Polygon', () => {
		expect(validatePolygon(validPolygon)).toBeTruthy();
	});
	test('should error if polygon is not a length of 1', () => {
		expect(() => validatePolygon(polygonTooBig)).toThrowError(
			`Polygon ${JSON.stringify(
				polygonTooBig
			)} geometry.polygon must have a single LinearRing array`
		);
		expect(() => validatePolygon([])).toThrowError(
			`Polygon ${JSON.stringify(
				[]
			)} geometry.polygon must have a single LinearRing array`
		);
	});
});

describe('validateGeofences', () => {
	test('should return true for valid geofences', () => {
		const result = validateGeofences(validGeofences);
		expect(result).toBeTruthy();
	});
	test('should error if a geofenceId is not unique', () => {
		expect(() => validateGeofences(geofencesWithDuplicate)).toThrowError(
			`Duplicate geofenceId: validGeofenceId1`
		);
	});
	test('should error if a geofenceId is not valid', () => {
		expect(() => validateGeofences(geofencesWithInvalidId)).toThrowError(
			`Invalid geofenceId: t|-|!$ !$ N()T V@|_!D Ids can only contain alphanumeric characters, hyphens, underscores and periods.`
		);
	});
});
