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
	maps?: {
		items: {};
		default: string;
	};
	place_indexes?: {};
}

// Data held about maps in aws-exports
export interface MapStyle {
	mapName: string;
	style: string;
}

export type Latitude = number;
export type Longitude = number;

/// P
export type Coordinates = [Latitude, Longitude];

// SW Latitude point for bounding box
export type SWLatitude = Latitude;
// SW Longitude point for bounding box
export type SWLongitude = Longitude;
// SW Latitude point for bounding box
export type NELatitude = Latitude;
// SW Longitude point for bounding box
export type NELongitude = Longitude;
// Full Bounding Box point array
export type BoundingBox = [SWLatitude, SWLongitude, NELatitude, NELongitude];

// Base items for SearchByText options
export interface SearchByTextOptionsBase {
	countries?: string[];
	maxResults?: number;
	placeIndexName?: string;
	provider?: string;
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
