// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomUserAgentDetails } from '@aws-amplify/core';
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
	searchByPlaceIdOptions,
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
	searchByText(
		text: string,
		options?: SearchByTextOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<Place[]>;

	// search by coordinates and return a matching place
	searchByCoordinates(
		coordinates: Coordinates,
		options?: SearchByCoordinatesOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<Place>;

	searchForSuggestions(
		text: string,
		options?: SearchByTextOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<SearchForSuggestionsResults>;

	searchByPlaceId(
		placeId: string,
		options?: searchByPlaceIdOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<Place | undefined>;

	// create geofences
	saveGeofences(
		geofences: GeofenceInput[],
		options?: GeofenceOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<SaveGeofencesResults>;

	// get a single geofence
	getGeofence(
		geofenceId: GeofenceId,
		options?: ListGeofenceOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<Geofence>;

	// list all geofences
	listGeofences(
		options?: ListGeofenceOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<ListGeofenceResults>;

	// Delete geofences
	deleteGeofences(
		geofenceIds: string[],
		options?: GeofenceOptions,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<DeleteGeofencesResults>;
}
