// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
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

	searchByPlaceId(
		placeId: string,
		options?: searchByPlaceIdOptions
	): Promise<Place | undefined>;

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
