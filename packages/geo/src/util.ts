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
import booleanClockwise from '@turf/boolean-clockwise';

import {
	Longitude,
	Latitude,
	GeofenceId,
	GeofenceInput,
	GeofencePolygon,
	LinearRing,
} from './types';

export function validateCoordinates(lng: Longitude, lat: Latitude): void {
	if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
		throw new Error(`Invalid coordinates: [${lng},${lat}]`);
	}
	if (lat < -90 || 90 < lat) {
		throw new Error('Latitude must be between -90 and 90 degrees inclusive.');
	} else if (lng < -180 || 180 < lng) {
		throw new Error(
			'Longitude must be between -180 and 180 degrees inclusive.'
		);
	}
}

export function validateGeofenceId(geofenceId: GeofenceId): void {
	const geofenceIdRegex = /^[-._\p{L}\p{N}]+$/iu;

	// Check if geofenceId is valid
	if (!geofenceIdRegex.test(geofenceId)) {
		throw new Error(
			`Invalid geofenceId: '${geofenceId}' - IDs can only contain alphanumeric characters, hyphens, underscores and periods.`
		);
	}
}

export function validateLinearRing(
	linearRing: LinearRing,
	geofenceId?: GeofenceId
): void {
	const errorPrefix = geofenceId ? `${geofenceId}: ` : '';
	// Validate LinearRing size, must be at least 4 points
	if (linearRing.length < 4) {
		throw new Error(
			`${errorPrefix}LinearRing must contain 4 or more coordinates.`
		);
	}

	// Validate all coordinates are valid, error with which ones are bad
	const badCoordinates = [];
	linearRing.forEach(coordinates => {
		try {
			validateCoordinates(coordinates[0], coordinates[1]);
		} catch (error) {
			badCoordinates.push({ coordinates, error: error.message });
		}
	});
	if (badCoordinates.length > 0) {
		throw new Error(
			`${errorPrefix}One or more of the coordinates in the Polygon LinearRing are not valid: ${JSON.stringify(
				badCoordinates
			)}`
		);
	}

	// Validate first and last coordinates are the same
	const [lngA, latA] = linearRing[0];
	const [lngB, latB] = linearRing[linearRing.length - 1];

	if (lngA !== lngB || latA !== latB) {
		throw new Error(
			`${errorPrefix}LinearRing's first and last coordinates are not the same`
		);
	}

	if (booleanClockwise(linearRing)) {
		throw new Error(
			`${errorPrefix}LinearRing coordinates must be wound counterclockwise`
		);
	}
}

export function validatePolygon(
	polygon: GeofencePolygon,
	geofenceId?: GeofenceId
): void {
	const errorPrefix = geofenceId ? `${geofenceId}: ` : '';
	if (!Array.isArray(polygon)) {
		throw new Error(
			`${errorPrefix}Polygon is of incorrect structure. It should be an array of LinearRings`
		);
	}
	if (polygon.length < 1) {
		throw new Error(
			`${errorPrefix}Polygon must have a single LinearRing array.`
		);
	}
	if (polygon.length > 1) {
		throw new Error(
			`${errorPrefix}Polygon must have a single LinearRing array. Note: We do not currently support polygons with holes, multipolygons, polygons that are wound clockwise, or that cross the antimeridian.`
		);
	}
	const verticesCount = polygon.reduce(
		(prev, linearRing) => prev + linearRing.length,
		0
	);
	if (verticesCount > 1000) {
		throw new Error(
			`${errorPrefix}Polygon has more than the maximum 1000 vertices.`
		);
	}
}

export function validateGeofencesInput(geofences: GeofenceInput[]) {
	const geofenceIds = {};

	geofences.forEach((geofence: GeofenceInput) => {
		// verify all required properties are present

		// Validate geofenceId exists
		if (!geofence.geofenceId) {
			throw new Error(`Geofence '${geofence}' is missing geofenceId`);
		}
		const { geofenceId } = geofence;
		validateGeofenceId(geofenceId);

		// Validate geofenceId is unique
		if (geofenceIds[geofenceId]) {
			throw new Error(`Duplicate geofenceId: ${geofenceId}`);
		} else {
			geofenceIds[geofenceId] = true;
		}

		// Validate geometry exists
		if (!geofence.geometry) {
			throw new Error(`Geofence '${geofenceId}' is missing geometry`);
		}
		const { geometry } = geofence;

		// Validate polygon exists
		if (!geometry.polygon) {
			throw new Error(`Geofence '${geofenceId}' is missing geometry.polygon`);
		}
		const { polygon } = geometry;

		// Validate polygon length and structure
		try {
			validatePolygon(polygon, geofenceId);
		} catch (error) {
			if (
				error.message.includes(
					'Polygon has more than the maximum 1000 vertices.'
				)
			) {
				throw new Error(
					`Geofence '${geofenceId}' has more than the maximum of 1000 vertices`
				);
			}
		}

		// Validate LinearRing length, structure, and coordinates
		const [linearRing] = polygon;
		validateLinearRing(linearRing, geofenceId);
	});
}
