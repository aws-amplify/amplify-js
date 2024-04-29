// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, ConsoleLogger } from '@aws-amplify/core';

import { AmazonLocationServiceProvider } from './providers/location-service/AmazonLocationServiceProvider';
import { validateCoordinates } from './util';
import {
	Coordinates,
	DeleteGeofencesResults,
	GeoConfig,
	GeoProvider,
	Geofence,
	GeofenceId,
	GeofenceInput,
	GeofenceOptions,
	ListGeofenceOptions,
	ListGeofenceResults,
	MapStyle,
	Place,
	SaveGeofencesResults,
	SearchByCoordinatesOptions,
	SearchByTextOptions,
	SearchForSuggestionsResults,
	searchByPlaceIdOptions,
} from './types';

const logger = new ConsoleLogger('Geo');

const DEFAULT_PROVIDER = 'AmazonLocationService';
export class GeoClass {
	static MODULE = 'Geo';
	/**
	 * @private
	 */
	private _config?: GeoConfig;
	private _pluggables: GeoProvider[];

	constructor() {
		this._config = undefined;
		this._pluggables = [];

		const amplifyConfig = Amplify.getConfig() ?? {};
		this._config = Object.assign({}, this._config, amplifyConfig.Geo);

		const locationProvider = new AmazonLocationServiceProvider(
			amplifyConfig.Geo,
		);
		this._pluggables.push(locationProvider);

		logger.debug('Geo Options', this._config);
	}

	/**
	 * get the name of the module category
	 * @returns {string} name of the module category
	 */
	public getModuleName() {
		return GeoClass.MODULE;
	}

	/**
	 * add plugin into Geo category
	 * @param {Object} pluggable an instance of the plugin
	 */
	public addPluggable(pluggable: GeoProvider) {
		if (pluggable && pluggable.getCategory() === 'Geo') {
			this._pluggables.push(pluggable);
		}
	}

	/**
	 * Get the plugin object
	 * @param providerName the name of the plugin
	 */
	public getPluggable(providerName: string) {
		const targetPluggable = this._pluggables.find(
			pluggable => pluggable.getProviderName() === providerName,
		);
		if (targetPluggable === undefined) {
			logger.debug('No plugin found with providerName', providerName);
			throw new Error('No plugin found in Geo for the provider');
		} else return targetPluggable;
	}

	/**
	 * Remove the plugin object
	 * @param providerName the name of the plugin
	 */
	public removePluggable(providerName: string) {
		this._pluggables = this._pluggables.filter(
			pluggable => pluggable.getProviderName() !== providerName,
		);
	}

	/**
	 * Get the map resources that are currently available through the provider
	 * @param {string} provider
	 * @returns - Array of available map resources
	 */
	public getAvailableMaps(provider = DEFAULT_PROVIDER): MapStyle[] {
		const prov = this.getPluggable(provider);

		return prov.getAvailableMaps();
	}

	/**
	 * Get the map resource set as default in amplify config
	 * @param {string} provider
	 * @returns - Map resource set as the default in amplify config
	 */
	public getDefaultMap(provider = DEFAULT_PROVIDER): MapStyle {
		const prov = this.getPluggable(provider);

		return prov.getDefaultMap();
	}

	/**
	 * Search by text input with optional parameters
	 * @param  {string} text The text string that is to be searched for
	 * @param  {SearchByTextOptions} options Optional parameters to the search
	 * @returns {Promise<Place[]>} - Promise resolves to a list of Places that match search parameters
	 */
	public async searchByText(
		text: string,
		options?: SearchByTextOptions,
	): Promise<Place[]> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		try {
			return await prov.searchByText(text, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * Search for search term suggestions based on input text
	 * @param  {string} text The text string that is to be search for
	 * @param  {SearchByTextOptions} options Optional parameters to the search
	 * @returns a `Promise` of {@link SearchForSuggestionsResults} that resolves to an array of search suggestion strings
	 */
	public async searchForSuggestions(
		text: string,
		options?: SearchByTextOptions,
	) {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		try {
			return await prov.searchForSuggestions(text, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * Search for location by unique ID
	 * @param  {string} placeId Unique ID of the location that is to be searched for
	 * @param  {searchByPlaceIdOptions} options Optional parameters to the search
	 * @returns {Promise<Place>} - Resolves to a place with the given placeId
	 */
	public async searchByPlaceId(
		placeId: string,
		options?: searchByPlaceIdOptions,
	) {
		const providerName = DEFAULT_PROVIDER;
		const prov = this.getPluggable(providerName);

		try {
			return await prov.searchByPlaceId(placeId, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * Reverse geocoding search via a coordinate point on the map
	 * @param coordinates Coordinates array for the search input
	 * @param options Options parameters for the search
	 * @returns {Promise<Place>} - Promise that resolves to a place matching search coordinates
	 */
	public async searchByCoordinates(
		coordinates: Coordinates,
		options?: SearchByCoordinatesOptions,
	): Promise<Place> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		const [lng, lat] = coordinates;
		try {
			validateCoordinates(lng, lat);

			return await prov.searchByCoordinates(coordinates, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * Create geofences
	 * @param geofences Single or array of geofence objects to create
	 * @param options Optional parameters for creating geofences
	 * @returns {Promise<SaveGeofencesResults>} - Promise that resolves to an object with:
	 *   successes: list of geofences successfully created
	 *   errors: list of geofences that failed to create
	 */
	public async saveGeofences(
		geofences: GeofenceInput | GeofenceInput[],
		options?: GeofenceOptions,
	): Promise<SaveGeofencesResults> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		// If single geofence input, make it an array for batch call
		let geofenceInputArray;
		if (!Array.isArray(geofences)) {
			geofenceInputArray = [geofences];
		} else {
			geofenceInputArray = geofences;
		}

		try {
			return await prov.saveGeofences(geofenceInputArray, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * Get a single geofence by geofenceId
	 * @param geofenceId The string id of the geofence to get
	 * @param options Optional parameters for getting a geofence
	 * @returns Promise<Geofence> - Promise that resolves to a geofence object
	 */
	public async getGeofence(
		geofenceId: GeofenceId,
		options?: GeofenceOptions,
	): Promise<Geofence> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		try {
			return await prov.getGeofence(geofenceId, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * List geofences
	 * @param  options ListGeofenceOptions
	 * @returns a promise that resolves to an object that conforms to {@link ListGeofenceResults}:
	 *   entries: list of geofences - 100 geofences are listed per page
	 *   nextToken: token for next page of geofences
	 */
	public async listGeofences(
		options?: ListGeofenceOptions,
	): Promise<ListGeofenceResults> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		try {
			return await prov.listGeofences(options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}

	/**
	 * Delete geofences
	 * @param geofenceIds string|string[]
	 * @param options GeofenceOptions
	 * @returns {Promise<DeleteGeofencesResults>} - Promise that resolves to an object with:
	 *  successes: list of geofences successfully deleted
	 *  errors: list of geofences that failed to delete
	 */
	public async deleteGeofences(
		geofenceIds: string | string[],
		options?: GeofenceOptions,
	): Promise<DeleteGeofencesResults> {
		const { providerName = DEFAULT_PROVIDER } = options || {};
		const prov = this.getPluggable(providerName);

		// If single geofence input, make it an array for batch call
		let geofenceIdsInputArray;
		if (!Array.isArray(geofenceIds)) {
			geofenceIdsInputArray = [geofenceIds];
		} else {
			geofenceIdsInputArray = geofenceIds;
		}

		//  Delete geofences
		try {
			return await prov.deleteGeofences(geofenceIdsInputArray, options);
		} catch (error) {
			logger.debug(error);
			throw error;
		}
	}
}

export const Geo = new GeoClass();
