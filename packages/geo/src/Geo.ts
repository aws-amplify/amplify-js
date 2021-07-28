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
	Amplify,
	ConsoleLogger as Logger,
	parseMobileHubConfig,
} from '@aws-amplify/core';
import { AmazonLocationServicesProvider } from './Providers/AmazonLocationServicesProvider';

import { GeoConfig, GeoProvider, MapStyle } from './types';

const logger = new Logger('Geo');

const DEFAULT_PROVIDER = 'AmazonLocationServices';
export class GeoClass {
	static MODULE = 'Geo';
	/**
	 * @private
	 */
	private _config: GeoConfig;
	private _pluggables: GeoProvider[];

	constructor() {
		this._config = {};
		this._pluggables = [];
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
	 * @param {Object} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: GeoProvider) {
		if (pluggable && pluggable.getCategory() === 'Geo') {
			this._pluggables.push(pluggable);
			const config = pluggable.configure(this._config);

			return config;
		}
	}

	/**
	 * Get the plugin object
	 * @param providerName - the name of the plugin
	 */
	public getPluggable(providerName: string) {
		const pluggable = this._pluggables.find(
			pluggable => pluggable.getProviderName() === providerName
		);
		if (pluggable === undefined) {
			logger.debug('No plugin found with providerName', providerName);
			return null;
		} else return pluggable;
	}

	/**
	 * Remove the plugin object
	 * @param providerName - the name of the plugin
	 */
	public removePluggable(providerName: string) {
		this._pluggables = this._pluggables.filter(
			pluggable => pluggable.getProviderName() !== providerName
		);
		return;
	}

	/**
	 * Configure Geo
	 * @param {Object} config - Configuration object for Geo
	 * @return {Object} - Current configuration
	 */
	configure(config?) {
		logger.debug('configure Geo');

		if (!config) return this._config;

		const amplifyConfig = parseMobileHubConfig(config);
		this._config = Object.assign({}, this._config, amplifyConfig.Geo);

		this._pluggables.forEach(pluggable => {
			pluggable.configure(this._config);
		});

		if (this._pluggables.length === 0) {
			this.addPluggable(new AmazonLocationServicesProvider());
		}
		return this._config;
	}

	/**
	 * Get the map resources that are currently available through the provider
	 * @param {string} provider
	 * @returns - Array of available map resources
	 */
	public getAvailableMaps(provider = DEFAULT_PROVIDER): MapStyle[] | string {
		const prov = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', provider);
			throw 'No plugin found in Geo for the provider';
		}

		return prov.getAvailableMaps();
	}

	/**
	 * Get the map resource set as default in amplify config
	 * @param {string} provider
	 * @returns - Map resource set as the default in amplify config
	 */
	public getDefaultMap(provider = DEFAULT_PROVIDER): MapStyle | string {
		const prov = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', provider);
			throw 'No plugin found in Geo for the provider';
		}

		return prov.getDefaultMap();
	}
}

export const Geo = new GeoClass();
Amplify.register(Geo);
