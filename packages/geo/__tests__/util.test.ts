// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	validateCoordinates,
	validateLinearRing,
	validatePolygon,
	validateGeofenceId,
	validateGeofencesInput,
	mapSearchOptions,
} from '../src/util';

import {
	invalidLngCoordinates,
	invalidLatCoordinates,
	infiniteCoordinates,
	validLinearRing,
	clockwiseLinearRing,
	linearRingIncomplete,
	linearRingTooSmall,
	linearRingBadCoordinates,
	validPolygon,
	polygonTooBig,
	polygonTooManyVertices,
	validGeofences,
	geofencesWithDuplicate,
	geofencesWithInvalidId,
	geofenceWithTooManyVertices,
	searchOptions,
	searchOptionsMappedToInput,
	locationServiceInput,
} from './testData';

describe('Geo utility functions', () => {
	describe('validateCoordinates', () => {
		test('should not throw an error for valid coordinates', () => {
			validLinearRing.forEach(([lng, lat]) => {
				expect(() => validateCoordinates(lng, lat)).not.toThrow();
			});
		});

		test('should error with message for bad longitude', () => {
			invalidLngCoordinates.forEach(([lng, lat]) => {
				expect(() => validateCoordinates(lng, lat)).toThrow(
					'Longitude must be between -180 and 180 degrees inclusive.',
				);
			});
		});

		test('should error with message for bad latitude', () => {
			invalidLatCoordinates.forEach(([lng, lat]) => {
				expect(() => validateCoordinates(lng, lat)).toThrow(
					'Latitude must be between -90 and 90 degrees inclusive.',
				);
			});
		});

		test('should error with message for coordinates with infinity', () => {
			infiniteCoordinates.forEach(([lng, lat]) => {
				expect(() => validateCoordinates(lng, lat)).toThrow(
					`Invalid coordinates: [${lng},${lat}]`,
				);
			});
		});
	});

	describe('validateLinearRing', () => {
		test('should not throw an error for a valid LinearRing', () => {
			const result = validateLinearRing(validLinearRing);
			expect(() => result).not.toThrow();
		});
		test('should error if first and last coordinates do not match', () => {
			expect(() =>
				validateLinearRing(linearRingIncomplete, 'linearRingIncomplete'),
			).toThrow(
				`linearRingIncomplete: LinearRing's first and last coordinates are not the same`,
			);
		});
		test('should error if LinearRing has less than 4 elements', () => {
			expect(() =>
				validateLinearRing(linearRingTooSmall, 'linearRingTooSmall'),
			).toThrow(
				'linearRingTooSmall: LinearRing must contain 4 or more coordinates.',
			);
		});
		test('should error if any coordinates are not valid', () => {
			expect(() =>
				validateLinearRing(
					linearRingBadCoordinates,
					'linearRingBadCoordinates',
				),
			).toThrow(
				'linearRingBadCoordinates: One or more of the coordinates in the Polygon LinearRing are not valid: [{"coordinates":[181,0],"error":"Longitude must be between -180 and 180 degrees inclusive."},{"coordinates":[0,-91],"error":"Latitude must be between -90 and 90 degrees inclusive."}]',
			);
		});
		test('should error if the coordinates are not in counterclockwise order', () => {
			expect(() =>
				validateLinearRing(clockwiseLinearRing, 'clockwiseLinearRing'),
			).toThrow(
				'clockwiseLinearRing: LinearRing coordinates must be wound counterclockwise',
			);
		});
	});

	describe('validatePolygon', () => {
		test('should not throw an error for a valid Polygon', () => {
			expect(() => validatePolygon(validPolygon)).not.toThrow();
		});
		test('should error if polygon is not a length of 1', () => {
			expect(() => validatePolygon(polygonTooBig, 'polygonTooBig')).toThrow(
				`polygonTooBig: Polygon must have a single LinearRing array. Note: We do not currently support polygons with holes, multipolygons, polygons that are wound clockwise, or that cross the antimeridian.`,
			);
			expect(() => validatePolygon([], 'emptyPolygon')).toThrow(
				`emptyPolygon: Polygon must have a single LinearRing array.`,
			);
		});
		test('should error if polygon has more than 1000 vertices', () => {
			expect(() =>
				validatePolygon(polygonTooManyVertices, 'polygonTooManyVertices'),
			).toThrow(
				'polygonTooManyVertices: Polygon has more than the maximum 1000 vertices.',
			);
		});
	});

	describe('validateGeofenceId', () => {
		test('should not throw an error for a geofence ID with letters and numbers', () => {
			expect(() => validateGeofenceId('ExampleGeofence1')).not.toThrow();
		});

		test('should not throw an error for a geofence ID with a dash', () => {
			expect(() => validateGeofenceId('ExampleGeofence-1')).not.toThrow();
		});

		test('should not throw an error for a geofence ID with a period', () => {
			expect(() => validateGeofenceId('ExampleGeofence.1')).not.toThrow();
		});

		test('should not throw an error for a geofence ID with an underscore', () => {
			expect(() => validateGeofenceId('ExampleGeofence_1')).not.toThrow();
		});

		test('should not throw an error for a geofence ID with non-basic Latin character', () => {
			expect(() => validateGeofenceId('ExampleGeòfence-1')).not.toThrow();
		});

		test('should not throw an error for a geofence ID with superscript and subscript numbers', () => {
			expect(() => validateGeofenceId('ExampleGeofence-⁴₆')).not.toThrow();
		});

		test('should throw an error for an empty string', () => {
			expect(() => validateGeofenceId('')).toThrow();
		});

		test('should throw an error for a geofence ID with an invalid character', () => {
			expect(() => validateGeofenceId('ExampleGeofence-1&')).toThrow();
		});
	});

	describe('validateGeofencesInput', () => {
		test('should not throw an error for valid geofences', () => {
			const result = validateGeofencesInput(validGeofences);
			expect(() => result).not.toThrow();
		});
		test('should error if a geofenceId is not unique', () => {
			expect(() => validateGeofencesInput(geofencesWithDuplicate)).toThrow(
				`Duplicate geofenceId: validGeofenceId1`,
			);
		});
		test('should error if a geofenceId is not valid', () => {
			expect(() => validateGeofencesInput(geofencesWithInvalidId)).toThrow(
				`Invalid geofenceId: 't|-|!$ !$ N()T V@|_!D' - IDs can only contain alphanumeric characters, hyphens, underscores and periods.`,
			);
		});
	});
	test('should error if polygon has more than 1000 vertices', () => {
		expect(() => validateGeofencesInput([geofenceWithTooManyVertices])).toThrow(
			`Geofence 'geofenceWithTooManyVertices' has more than the maximum of 1000 vertices`,
		);
	});

	describe('mapSearchOptions', () => {
		test('should map search options to Amazon Location Service input object', () => {
			const result = mapSearchOptions(searchOptions, locationServiceInput);
			expect(result).toEqual(searchOptionsMappedToInput);
		});

		test('should map search options with bias position to Amazon Location Service input object', () => {
			const searchOptionsWithBiasPosition = {
				...searchOptions,
				biasPosition: [12345, 67890],
			};
			const modifiedSearchOptionsMappedToInput = {
				...searchOptionsMappedToInput,
				BiasPosition: searchOptionsWithBiasPosition.biasPosition,
			};
			const result = mapSearchOptions(
				searchOptionsWithBiasPosition,
				locationServiceInput,
			);
			expect(result).toEqual(modifiedSearchOptionsMappedToInput);
		});

		test('should map search options with search area constraints to Amazon Location Service input object', () => {
			const searchOptionsWithSearchAreaConstraints = {
				...searchOptions,
				searchAreaConstraints: [123, 456, 789, 321],
			};
			const modifiedSearchOptionsMappedToInput = {
				...searchOptionsMappedToInput,
				FilterBBox:
					searchOptionsWithSearchAreaConstraints.searchAreaConstraints,
			};
			const result = mapSearchOptions(
				searchOptionsWithSearchAreaConstraints,
				locationServiceInput,
			);
			expect(result).toEqual(modifiedSearchOptionsMappedToInput);
		});

		test('should throw error when trying to map search options with bias position and search area constraints to Amazon Location Service input object', () => {
			const searchOptionsExtended = {
				...searchOptions,
				biasPosition: [12345, 67890],
				searchAreaConstraints: [123, 456, 789, 321],
			};
			expect(() => mapSearchOptions(searchOptionsExtended, {})).toThrow(
				`BiasPosition and SearchAreaConstraints are mutually exclusive, please remove one or the other from the options object`,
			);
		});
	});
});
