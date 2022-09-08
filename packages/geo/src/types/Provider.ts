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
	SearchByTextOptions,
	SearchByCoordinatesOptions,
	SearchForSuggestionsResults,
	Coordinates,
	Place,
	MapStyle,
	Geofence,
	GeofenceId,
	GeofenceInput,
	GeofenceOptions,
	ListGeofenceOptions,
	ListGeofenceResults,
	SaveGeofencesResults,
	DeleteGeofencesResults,
	SearchForLocationByIdOptions,
} from './Geo';

export interface GeoProvider {
	// get the category name for the provider
	getCategory(): string;

	// get provider name
	getProviderName(): string;

	// configure your provider
	configure(config: object): object;

	// get the available map resources
	getAvailableMaps(): MapStyle[];

	// get the map resource listed as default
	getDefaultMap(): MapStyle;

	// search by a text string and return a list of places
	searchByText(text: string, options?: SearchByTextOptions): Promise<Place[]>;

	// search by coordinates and return a matching place
	searchByCoordinates(
		coordinates: Coordinates,
		options?: SearchByCoordinatesOptions
	): Promise<Place>;

	searchForSuggestions(
		text: string,
		options?: SearchByTextOptions
	): Promise<SearchForSuggestionsResults>;

	searchForLocationById(
		placeId: string,
		options?: SearchForLocationByIdOptions
	): Promise<Place>;

	// create geofences
	saveGeofences(
		geofences: GeofenceInput[],
		options?: GeofenceOptions
	): Promise<SaveGeofencesResults>;

	// get a single geofence
	getGeofence(
		geofenceId: GeofenceId,
		options?: ListGeofenceOptions
	): Promise<Geofence>;

	// list all geofences
	listGeofences(options?: ListGeofenceOptions): Promise<ListGeofenceResults>;

	// Delete geofences
	deleteGeofences(
		geofenceIds: string[],
		options?: GeofenceOptions
	): Promise<DeleteGeofencesResults>;
}
