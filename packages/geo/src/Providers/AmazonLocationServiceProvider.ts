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
import camelcaseKeys from 'camelcase-keys';
import {
	ConsoleLogger as Logger,
	Credentials,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import {
	Place as PlaceResult,
	SearchPlaceIndexForTextCommandInput,
	LocationClient,
	SearchPlaceIndexForTextCommand,
	SearchPlaceIndexForPositionCommand,
	SearchPlaceIndexForPositionCommandInput,
} from '@aws-sdk/client-location';

import {
	GeoConfig,
	SearchByTextOptions,
	SearchByCoordinatesOptions,
	GeoProvider,
	Place,
	AmazonLocationServiceMapStyle,
	Coordinates,
} from '../types';

const logger = new Logger('AmazonLocationServiceProvider');

export class AmazonLocationServiceProvider implements GeoProvider {
	static CATEGORY = 'Geo';
	static PROVIDER_NAME = 'AmazonLocationService';

	/**
	 * @private
	 */
	private _config;

	/**
	 * Initialize Geo with AWS configurations
	 * @param {Object} config - Configuration object for Geo
	 */
	constructor(config?: GeoConfig) {
		this._config = config ? config : {};
		logger.debug('Geo Options', this._config);
	}

	/**
	 * get the category of the plugin
	 * @returns {string} name of the category
	 */
	public getCategory(): string {
		return AmazonLocationServiceProvider.CATEGORY;
	}

	/**
	 * get provider name of the plugin
	 * @returns {string} name of the provider
	 */
	public getProviderName(): string {
		return AmazonLocationServiceProvider.PROVIDER_NAME;
	}

	/**
	 * Configure Geo part with aws configuration
	 * @param {Object} config - Configuration of the Geo
	 * @return {Object} - Current configuration
	 */
	public configure(config?): object {
		logger.debug('configure Amazon Location Service Provider', config);
		if (!config) return this._config;
		this._config = Object.assign({}, this._config, config);
		return this._config;
	}

	/**
	 * Get the map resources that are currently available through the provider
	 * @returns {AmazonLocationServiceMapStyle[]}- Array of available map resources
	 */
	public getAvailableMaps(): AmazonLocationServiceMapStyle[] {
		this._verifyMapResources();

		const mapStyles: AmazonLocationServiceMapStyle[] = [];
		const availableMaps = this._config.maps.items;
		const region = this._config.region;

		for (const mapName in availableMaps) {
			const style = availableMaps[mapName].style;
			mapStyles.push({ mapName, style, region });
		}

		return mapStyles;
	}

	/**
	 * Get the map resource set as default in amplify config
	 * @returns {AmazonLocationServiceMapStyle} - Map resource set as the default in amplify config
	 */
	public getDefaultMap(): AmazonLocationServiceMapStyle {
		this._verifyMapResources();

		const mapName = this._config.maps.default;
		const style = this._config.maps.items[mapName].style;
		const region = this._config.region;

		return { mapName, style, region };
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
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			throw new Error('No credentials');
		}

		this._verifySearchIndex(options?.searchIndexName);

		/**
		 * Setup the searchInput
		 */
		const locationServiceInput: SearchPlaceIndexForTextCommandInput = {
			Text: text,
			IndexName: this._config.search_indices.default,
		};

		/**
		 * Map search options to Amazon Location Service input object
		 */
		if (options) {
			locationServiceInput.FilterCountries = options.countries;
			locationServiceInput.MaxResults = options.maxResults;

			if (options.searchIndexName) {
				locationServiceInput.IndexName = options.searchIndexName;
			}

			if (options['biasPosition']) {
				locationServiceInput.BiasPosition = options['biasPosition'];
			} else if (options['searchAreaConstraints']) {
				locationServiceInput.FilterBBox = options['searchAreaConstraints'];
			}
		}

		const client = new LocationClient({
			credentials: this._config.credentials,
			region: this._config.region,
			customUserAgent: getAmplifyUserAgent(),
		});
		const command = new SearchPlaceIndexForTextCommand(locationServiceInput);

		let response;
		try {
			response = await client.send(command);
		} catch (error) {
			logger.debug(error);
			throw error;
		}

		/**
		 * The response from Amazon Location Service is a "Results" array of objects with a single `Place` item,
		 * which are Place objects in PascalCase.
		 * Here we want to flatten that to an array of results and change them to camelCase
		 */
		const PascalResults: PlaceResult[] = response.Results.map(
			result => result.Place
		);
		const results: Place[] = (camelcaseKeys(PascalResults, {
			deep: true,
		}) as undefined) as Place[];

		return results;
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
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			throw new Error('No credentials');
		}

		this._verifySearchIndex(options?.searchIndexName);

		const locationServiceInput: SearchPlaceIndexForPositionCommandInput = {
			Position: coordinates,
			IndexName: this._config.search_indices.default,
		};

		if (options) {
			if (options.searchIndexName) {
				locationServiceInput.IndexName = options.searchIndexName;
			}
			locationServiceInput.MaxResults = options.maxResults;
		}

		const client = new LocationClient({
			credentials: this._config.credentials,
			region: this._config.region,
			customUserAgent: getAmplifyUserAgent(),
		});
		const command = new SearchPlaceIndexForPositionCommand(
			locationServiceInput
		);

		let response;
		try {
			response = await client.send(command);
		} catch (error) {
			logger.debug(error);
			throw error;
		}

		/**
		 * The response from Amazon Location Service is a "Results" array with a single `Place` object
		 * which are Place objects in PascalCase.
		 * Here we want to flatten that to an array of results and change them to camelCase
		 */
		const PascalResults = response.Results.map(result => result.Place);
		const results: Place = (camelcaseKeys(PascalResults[0], {
			deep: true,
		}) as any) as Place;

		return results;
	}

	/**
	 * @private
	 */
	private async _ensureCredentials(): Promise<boolean> {
		try {
			const credentials = await Credentials.get();
			if (!credentials) return false;
			const cred = Credentials.shear(credentials);
			logger.debug('Set credentials for storage. Credentials are:', cred);
			this._config.credentials = cred;
			return true;
		} catch (error) {
			logger.warn('Ensure credentials error. Credentials are:', error);
			return false;
		}
	}

	private _verifyMapResources() {
		if (!this._config.maps) {
			const errorString =
				"No map resources found in amplify config, run 'amplify add geo' to create them and ensure to run `amplify push` after";
			logger.warn(errorString);
			throw new Error(errorString);
		}
		if (!this._config.maps.default) {
			const errorString =
				"No default map resource found in amplify config, run 'amplify add geo' to create one and ensure to run `amplify push` after";
			logger.warn(errorString);
			throw new Error(errorString);
		}
	}

	private _verifySearchIndex(optionalSearchIndex?: string) {
		if (
			(!this._config.search_indices || !this._config.search_indices.default) &&
			!optionalSearchIndex
		) {
			const errorString =
				'No Search Index found, please run `amplify add geo` to add one.';
			logger.warn(errorString);
			throw new Error(errorString);
		}
	}
}
