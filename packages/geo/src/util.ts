import { Coordinates } from './../../../.history/packages/geo/src/types/Geo_20211108163019';
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
import { Longitude, Latitude, Geofence, Polygon, LinearRing } from './types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('Geo');

export function validateCoordinates(lng: Longitude, lat: Latitude): boolean {
	if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
		throw new Error(`Invalid coordinates: [${lng},${lat}]`);
	}
	if (lat < -90 || lat > 90) {
		const errorString =
			'Latitude must be between -90 and 90 degrees inclusive.';
		logger.warn(errorString);
		throw new Error(errorString);
	} else if (lng < -180 || lng > 180) {
		const errorString =
			'Longitude must be between -180 and 180 degrees inclusive.';
		logger.warn(errorString);
		throw new Error(errorString);
	}
	return true;
}

export function validateGeofenceId(geofenceId: string) {
	const geofenceIdRegex = /^[-._\p{L}\p{N}]+$/iu;

	// Check if geofenceId is valid
	if (!geofenceIdRegex.test(geofenceId)) {
		const errorString = `Invalid geofenceId: ${geofenceId} Ids can only contain alphanumeric characters, hyphens, underscores and periods.`;
		logger.warn(errorString);
		throw new Error(errorString);
	}

	return true;
}

export function validateLinearRing(linearRing: LinearRing) {
	// Validate LinearRing size, must be at least 4 points
	if (linearRing.length < 4) {
		const errorString = 'LinearRing must contain 4 or more coordinates.';
		logger.warn(errorString);
		throw new Error(errorString);
	}

	// Validate all coordinates are valid
	try {
		linearRing.forEach(coordinates =>
			validateCoordinates(coordinates[0], coordinates[1])
		);
	} catch (error) {
		const errorString = 'One or more of the coordinates are not valid';
		logger.warn(errorString);
		throw new Error(errorString);
	}

	// Validate first and last coordinates are the same
	const [lngA, latA] = linearRing[0];
	const [lngB, latB] = linearRing[linearRing.length - 1];

	if (lngA !== lngB || latA !== latB) {
		const errorString = `LinearRing's first and last coordinates are not the same`;
		logger.warn(errorString);
		throw new Error(errorString);
	}

	return true;
}

export function validatePolygon(polygon: Polygon): boolean {
	if (!Array.isArray(polygon)) {
		const errorString = `Polygon ${JSON.stringify(
			polygon
		)} is of incorrect structure`;
		logger.warn(errorString);
		throw new Error(errorString);
	}
	if (!(polygon.length === 1)) {
		const errorString = `Polygon ${JSON.stringify(
			polygon
		)} geometry.polygon must have a single LinearRing array`;
		logger.warn(errorString);
		throw new Error(errorString);
	}
	return true;
}

export function validateGeofences(geofences: any[]) {
	const geofenceIds = {};

	geofences.forEach((geofence: Geofence) => {
		// verify all required properties are present
		if (!geofence.geofenceId) {
			const errorString = `Geofence ${JSON.stringify(
				geofence
			)} is missing geofenceId`;
			logger.warn(errorString);
			throw new Error(errorString);
		}

		if (!geofence.geometry) {
			const errorString = `Geofence ${JSON.stringify(
				geofence
			)} is missing geometry`;
			logger.warn(errorString);
			throw new Error(errorString);
		}

		if (!geofence.geometry.polygon) {
			const errorString = `Geofence ${JSON.stringify(
				geofence
			)} is missing geometry.polygon`;
			logger.warn(errorString);
			throw new Error(errorString);
		}

		const {
			geofenceId,
			geometry: { polygon },
		} = geofence;

		// Validate geofenceId is valid
		validateGeofenceId(geofenceId);

		// Validate geofenceId is unique
		if (geofenceIds[geofenceId]) {
			const errorString = `Duplicate geofenceId: ${geofenceId}`;
			logger.warn(errorString);
			throw new Error(errorString);
		} else {
			geofenceIds[geofenceId] = true;
		}

		// Validate polygon length and structure
		validatePolygon(polygon);

		// Validate LinearRing length, structure, and coordinates
		const [linearRing] = polygon;
		validateLinearRing(linearRing);
	});

	return true;
}
