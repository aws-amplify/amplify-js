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
	BatchPutGeofenceCommand,
	GetGeofenceCommand,
} from '@aws-sdk/client-location';
import camelcaseKeys from 'camelcase-keys';

import {
	Coordinates,
	LinearRing,
	GeofencePolygon,
	GeofenceInput,
	PolygonGeometry,
} from '../src/types';

export const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

export const awsConfig = {
	geo: {
		amazon_location_service: {
			maps: {
				items: {
					geoJsExampleMap1: {
						style: 'VectorEsriStreets',
					},
					geoJsExampleMap2: {
						style: 'VectorEsriTopographic',
					},
				},
				default: 'geoJsExampleMap1',
			},
			search_indices: {
				items: ['geoJSSearchExample'],
				default: 'geoJSSearchExample',
			},
			geofenceCollections: {
				items: ['geofenceCollectionExample'],
				default: 'geofenceCollectionExample',
			},
			region: 'us-west-2',
		},
	},
	credentials,
};

export const TestPlacePascalCase = {
	AddressNumber: '123',
	Country: 'United States',
	Geometry: {
		Point: [2345, 6789],
	},
	Label: "don't try to label me",
	Municipality: 'Muni',
	Neighborhood: 'hay',
	PostalCode: '00000',
	Region: 'us-west-2',
	Street: 'Heylo St',
	SubRegion: 'Underground',
};

export const testPlaceCamelCase = camelcaseKeys(TestPlacePascalCase, {
	deep: true,
});

// Coordinates
export const validCoordinates1: Coordinates = [
	-123.14695358276366, 49.290090146520434,
];
export const validCoordinates2: Coordinates = [
	-123.1358814239502, 49.294960279811974,
];
export const validCoordinates3: Coordinates = [
	-123.15021514892577, 49.29300108863353,
];
export const validCoordinates4: Coordinates = [
	-123.14909934997559, 49.29132171993048,
];
export const validCoordinates5: Coordinates = [
	-123.14695358276361, 49.290090146520431,
];

export const invalidLngCoordinates1: Coordinates = [181, 0];
export const invalidLngCoordinates2: Coordinates = [-181, 0];
export const invalidLngCoordinates: LinearRing = [
	invalidLngCoordinates1,
	invalidLngCoordinates2,
];

export const invalidLatCoordinates1: Coordinates = [0, -91];
export const invalidLatCoordinates2: Coordinates = [0, 91];
export const invalidLatCoordinates: LinearRing = [
	invalidLatCoordinates1,
	invalidLatCoordinates2,
];

export const infiniteLngCoordinate1: Coordinates = [Infinity, 0];
export const infiniteLngCoordinate2: Coordinates = [-Infinity, 0];
export const infiniteLatCoordinate1: Coordinates = [0, Infinity];
export const infiniteLatCoordinate2: Coordinates = [0, -Infinity];
export const infiniteCoordinates: LinearRing = [
	infiniteLngCoordinate1,
	infiniteLngCoordinate2,
	infiniteLatCoordinate1,
	infiniteLatCoordinate2,
];

// Linear Rings
export const validLinearRing: LinearRing = [
	validCoordinates1,
	validCoordinates2,
	validCoordinates3,
	validCoordinates4,
	validCoordinates1,
];

export const linearRingIncomplete: LinearRing = [
	validCoordinates1,
	validCoordinates2,
	validCoordinates3,
	validCoordinates4,
];
export const linearRingTooSmall: LinearRing = [
	validCoordinates1,
	validCoordinates2,
	validCoordinates1,
];
export const linearRingBadCoordinates: LinearRing = [
	invalidLngCoordinates1,
	invalidLatCoordinates1,
	validCoordinates2,
	validCoordinates3,
	validCoordinates4,
];

// Polygons
export const validPolygon: GeofencePolygon = [validLinearRing];
export const polygonTooBig: GeofencePolygon = [
	validLinearRing,
	validLinearRing,
];

// Geometry
export const validGeometry: PolygonGeometry = {
	polygon: validPolygon,
};

// Geofences
export const validGeofence1: GeofenceInput = {
	geofenceId: 'validGeofenceId1',
	geometry: validGeometry,
};
export const validGeofence2: GeofenceInput = {
	geofenceId: 'validGeofenceId2',
	geometry: validGeometry,
};
export const validGeofence3: GeofenceInput = {
	geofenceId: 'validGeofenceId3',
	geometry: validGeometry,
};
export const geofenceWithInvalidId: GeofenceInput = {
	geofenceId: 't|-|!$ !$ N()T V@|_!D',
	geometry: validGeometry,
};

export const validGeofences = [];
for (let i = 0; i < 132; i++) {
	validGeofences.push({
		geofenceId: `validGeofenceId${i}`,
		geometry: validGeometry,
	});
}

export const geofencesWithDuplicate = [
	validGeofence1,
	validGeofence2,
	validGeofence3,
	validGeofence1,
];
export const geofencesWithInvalidId = [
	validGeofence1,
	validGeofence2,
	validGeofence3,
	geofenceWithInvalidId,
];

export const singleGeofenceCamelcaseResults = {
	successes: [
		{
			createTime: '2020-04-01T21:00:00.000Z',
			updateTime: '2020-04-01T21:00:00.000Z',
			geofenceId: 'validGeofenceId1',
		},
	],
	errors: [],
};

export const batchGeofencesCamelcaseResults = {
	successes: validGeofences.map(({ geofenceId }, i) => {
		return {
			createTime: '2020-04-01T21:00:00.000Z',
			updateTime: '2020-04-01T21:00:00.000Z',
			geofenceId,
		};
	}),
	errors: [],
};

export function createGeofenceInputArray(numberOfGeofences) {
	const geofences = [];
	for (let i = 0; i < numberOfGeofences; i++) {
		geofences.push({
			geofenceId: `validGeofenceId${i}`,
			geometry: validGeometry,
		});
	}
	return geofences;
}

export function mockBatchPutGeofenceCommand(command) {
	if (command instanceof BatchPutGeofenceCommand) {
		return {
			Successes: command.input.Entries.map(geofence => {
				return {
					CreateTime: '2020-04-01T21:00:00.000Z',
					UpdateTime: '2020-04-01T21:00:00.000Z',
					GeofenceId: geofence.GeofenceId,
				};
			}),
			Errors: [],
		};
	}
}

export function mockGetGeofenceCommand(command) {
	const geofence = {
		GeofenceId: command.input.GeofenceId,
		Geometry: {
			Polygon: validPolygon,
		},
		CreateTime: '2020-04-01T21:00:00.000Z',
		UpdateTime: '2020-04-01T21:00:00.000Z',
		Status: 'ACTIVE',
	};

	if (command instanceof GetGeofenceCommand) {
		return geofence;
	}
}
