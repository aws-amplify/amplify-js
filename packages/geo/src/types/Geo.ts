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
import { GeoProvider } from './Provider';
export type GeoConfig = {
	region?: string;
	maps?: {
		items: {};
		default: string;
	};
	place_indexes?: {};
};

export type MapStyle = {
	mapName: string;
	style: string;
};

export type Latitude = number;
export type Longitude = number;

export type Coordinates = [Latitude, Longitude];

export type SWLatitude = Latitude;
export type SWLongitude = Longitude;
export type NELatitude = Latitude;
export type NELongitude = Longitude;
export type BoundingBox = [SWLatitude, SWLongitude, NELatitude, NELongitude];

export type SearchByTextOptions = {
	biasPosition?: Coordinates;
	searchAreaConstraints?: BoundingBox;
	countryFilter?: string[];
	maxResults?: number;
	placeIndex?: string;
	provider?: GeoProvider;
};

export type Place = {
	addressNumber: string;
	country: string;
	geometry: {
		point: Coordinates;
	};
	label: string;
	municipality: string;
	neighborhood?: string;
	postalCode?: string;
	region: string;
	street?: string;
	subRegion?: string;
};
