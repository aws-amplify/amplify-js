// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	Place,
	Coordinates,
	SearchByTextOptions,
	SearchByCoordinatesOptions,
	GeofenceId,
	GeofenceInput,
	GeofenceOptions,
	SaveGeofencesResults,
	Geofence,
	ListGeofenceOptions,
	ListGeofenceResults,
	DeleteGeofencesResults,
	searchByPlaceIdOptions,
} from './types';
import { InternalGeoClass } from './internals/InternalGeo';

export class GeoClass extends InternalGeoClass {
	static MODULE = 'Geo';

	/**
	 * get the name of the module category
	 * @returns {string} name of the module category
	 */
	public getModuleName() {
		return GeoClass.MODULE;
	}

	/**
	 * Search by text input with optional parameters
	 * @param  {string} text - The text string that is to be searched for
	 * @param  {SearchByTextOptions} options? - Optional parameters to the search
	 * @returns {Promise<Place[]>} - Promise resolves to a list of Places that match search parameters
	 */
	public async searchByText(
		text: string,
		options?: SearchByTextOptions
	): Promise<Place[]> {
		return super.searchByText(text, options);
	}

	/**
	 * Search for search term suggestions based on input text
	 * @param  {string} text - The text string that is to be search for
	 * @param  {SearchByTextOptions} options? - Optional parameters to the search
	 * @returns {Promise<SearchForSuggestionsResults>} - Resolves to an array of search suggestion strings
	 */
	public async searchForSuggestions(
		text: string,
		options?: SearchByTextOptions
	) {
		return super.searchForSuggestions(text, options);
	}

	/**
	 * Search for location by unique ID
	 * @param  {string} placeId - Unique ID of the location that is to be searched for
	 * @param  {searchByPlaceIdOptions} options? - Optional parameters to the search
	 * @returns {Promise<Place>} - Resolves to a place with the given placeId
	 */
	public async searchByPlaceId(
		placeId: string,
		options?: searchByPlaceIdOptions
	) {
		return super.searchByPlaceId(placeId, options);
	}

	/**
	 * Reverse geocoding search via a coordinate point on the map
	 * @param coordinates - Coordinates array for the search input
	 * @param options - Options parameters for the search
	 * @returns {Promise<Place>} - Promise that resolves to a place matching search coordinates
	 */
	public async searchByCoordinates(
		coordinates: Coordinates,
		options?: SearchByCoordinatesOptions
	): Promise<Place> {
		return super.searchByCoordinates(coordinates, options);
	}

	/**
	 * Create geofences
	 * @param geofences - Single or array of geofence objects to create
	 * @param options? - Optional parameters for creating geofences
	 * @returns {Promise<SaveGeofencesResults>} - Promise that resolves to an object with:
	 *   successes: list of geofences successfully created
	 *   errors: list of geofences that failed to create
	 */
	public async saveGeofences(
		geofences: GeofenceInput | GeofenceInput[],
		options?: GeofenceOptions
	): Promise<SaveGeofencesResults> {
		return super.saveGeofences(geofences, options);
	}

	/**
	 * Get a single geofence by geofenceId
	 * @param geofenceId: GeofenceId - The string id of the geofence to get
	 * @param options?: GeofenceOptions - Optional parameters for getting a geofence
	 * @returns Promise<Geofence> - Promise that resolves to a geofence object
	 */
	public async getGeofence(
		geofenceId: GeofenceId,
		options?: GeofenceOptions
	): Promise<Geofence> {
		return super.getGeofence(geofenceId, options);
	}

	/**
	 * List geofences
	 * @param  options?: ListGeofenceOptions
	 * @returns {Promise<ListGeofencesResults>} - Promise that resolves to an object with:
	 *   entries: list of geofences - 100 geofences are listed per page
	 *   nextToken: token for next page of geofences
	 */
	public async listGeofences(
		options?: ListGeofenceOptions
	): Promise<ListGeofenceResults> {
		return super.listGeofences(options);
	}

	/**
	 * Delete geofences
	 * @param geofenceIds: string|string[]
	 * @param options?: GeofenceOptions
	 * @returns {Promise<DeleteGeofencesResults>} - Promise that resolves to an object with:
	 *  successes: list of geofences successfully deleted
	 *  errors: list of geofences that failed to delete
	 */
	public async deleteGeofences(
		geofenceIds: string | string[],
		options?: GeofenceOptions
	): Promise<DeleteGeofencesResults> {
		return super.deleteGeofences(geofenceIds, options);
	}
}

export const Geo = new GeoClass();
Amplify.register(Geo);
