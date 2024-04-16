// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// configuration shape for the Geo class
export { GeoConfig } from '@aws-amplify/core';

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
	language?: string;
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

// Options object for searchByCoordinates
export interface SearchByCoordinatesOptions {
	maxResults?: number;
	searchIndexName?: string;
	providerName?: string;
}

export interface searchByPlaceIdOptions {
	searchIndexName?: string;
}

// Geometry object for Place points
export interface PlaceGeometry {
	point: Coordinates;
}

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
// Array of 4 or more coordinates, where the first and last coordinate are the same to form a closed boundary
export type LinearRing = Coordinates[];

// An array of one linear ring
export type GeofencePolygon = LinearRing[];

// Geometry object for Polygon
export interface PolygonGeometry {
	polygon: GeofencePolygon;
}

export type GeofenceId = string;

// Geofence object used as input for saveGeofences
export interface GeofenceInput {
	geofenceId: GeofenceId;
	geometry: PolygonGeometry;
}

// Options object for saveGeofences
export interface GeofenceOptions {
	providerName?: string;
}

// Error type for errors related to Geofence API calls
export interface GeofenceError {
	error: {
		code: string;
		message: string;
	};
	geofenceId: GeofenceId;
}

// Base geofence object
interface GeofenceBase {
	geofenceId: GeofenceId;
	createTime?: Date;
	updateTime?: Date;
}

// Results object for getGeofence
export type Geofence = GeofenceBase & {
	geometry: PolygonGeometry;
};

// Results object for saveGeofences
export interface SaveGeofencesResults {
	successes: GeofenceBase[];
	errors: GeofenceError[];
}

// Options object for listGeofence
export type ListGeofenceOptions = GeofenceOptions & {
	nextToken?: string;
};

// Results options for listGeofence
export interface ListGeofenceResults {
	entries: Geofence[];
	nextToken: string | undefined;
}

// Results object for deleteGeofence
export interface DeleteGeofencesResults {
	successes: GeofenceId[];
	errors: GeofenceError[];
}

// Return type for searchForSuggestions
export type SearchForSuggestionsResults = SearchForSuggestionsResult[];

export interface SearchForSuggestionsResult {
	text: string;
	placeId?: string;
}
