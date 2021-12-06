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
// configuration shape for the Geo class
export interface GeoConfig {
	region?: string;
	AmazonLocationService?: {
		maps?: {
			items: {};
			default: string;
		};
		search_indices?: {
			items: string[];
			default: string;
		};
		geofenceCollections?: {
			items: string[];
			default: string;
		};
	};
}

// Data held about maps in aws-exports
export interface MapStyle {
	mapName: string;
	style: string;
}

export type Longitude = number;
export type Latitude = number;

// Coordinates are a tuple of longitude and latitude
export type Coordinates = [Longitude, Latitude];

// SW Longitude point for bounding box
export type SWLongitude = Longitude;
// SW Latitude point for bounding box
export type SWLatitude = Latitude;
// SW Longitude point for bounding box
export type NELongitude = Longitude;
// SW Latitude point for bounding box
export type NELatitude = Latitude;
// Full Bounding Box point array
export type BoundingBox = [SWLongitude, SWLatitude, NELongitude, NELatitude];

// Base items for SearchByText options
export interface SearchByTextOptionsBase {
	countries?: string[];
	maxResults?: number;
	searchIndexName?: string;
	providerName?: string;
}

// SearchByText options with a bias position
export interface SearchByTextOptionsWithBiasPosition
	extends SearchByTextOptionsBase {
	biasPosition?: Coordinates;
}

// SearchByText options with search area constraints (such as a bounding box)
export interface SearchByTextOptionsWithSearchAreaConstraints
	extends SearchByTextOptionsBase {
	searchAreaConstraints?: BoundingBox;
}

// Union type for searchByText options
export type SearchByTextOptions =
	| SearchByTextOptionsWithBiasPosition
	| SearchByTextOptionsWithSearchAreaConstraints;

// Options object for searchByCoodinates
export type SearchByCoordinatesOptions = {
	maxResults?: number;
	searchIndexName?: string;
	providerName?: string;
};

// Geometry object for Place points
export type PlaceGeometry = {
	point: Coordinates;
};

// Place object with locality information
export interface Place {
	addressNumber?: string;
	country?: string;
	geometry: PlaceGeometry | undefined;
	label?: string;
	municipality?: string;
	neighborhood?: string;
	postalCode?: string;
	region?: string;
	street?: string;
	subRegion?: string;
}

// Return type for searchForSuggestions
export type SearchForSuggestionsResults = string[];
// Array of 4 or more coordinates, where the first and last coordinate are the same to form a closed boundary
export type LinearRing = Coordinates[];

// An array of one linear ring
export type GeofencePolygon = LinearRing[];

// Geometry object for Polygon
export type PolygonGeometry = {
	polygon: GeofencePolygon;
};

// Geofence object used as input for saveGeofences
export type GeofenceInput = {
	geofenceId: string;
	geometry: PolygonGeometry;
};

// Options object for saveGeofences
export type GeofenceOptions = {
	providerName?: string;
};

// Error type for errors related to Geofence API calls
export type GeofenceError = {
	error: {
		code: string;
		message: string;
	};
	geofenceId: string;
};

// Base geofence object
type GeofenceBase = {
	geofenceId: string;
	createTime?: Date;
	updateTime?: Date;
};

// Results object for getGeofence
export type Geofence = GeofenceBase & {
	geometry: PolygonGeometry;
};

// Results object for saveGeofences
export type SaveGeofencesResults = {
	successes: GeofenceBase[];
	errors: GeofenceError[];
};

// Options object for listGeofence
export type ListGeofenceOptions = GeofenceOptions & {
	nextToken?: string;
};

// Results options for listGeofence
export type ListGeofenceResults = {
	entries: Geofence[];
	nextToken: string;
};

// Results object for deleteGeofence
export type DeleteGeofencesResults = {
	successes: string[];
	errors: GeofenceError[];
};
