// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import { XRProvider, XROptions, SceneOptions } from './types';
import { SumerianProvider } from './Providers/SumerianProvider';
import { XRProviderNotConfigured } from './Errors';

const logger = new Logger('XR');

const DEFAULT_PROVIDER_NAME = 'SumerianProvider';

/**
 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
 * and as a result, will no longer be available.
 */
export class XRClass {
	private _options: XROptions;

	private _pluggables: { [key: string]: XRProvider };
	private _defaultProvider: string;

	/**
	 * Initialize XR with AWS configurations
	 *
	 * @param {XROptions} options - Configuration object for XR
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	constructor(options: XROptions) {
		this._options = options;
		logger.debug('XR Options', this._options);
		this._defaultProvider = DEFAULT_PROVIDER_NAME;
		this._pluggables = {};

		// Add default provider
		this.addPluggable(new SumerianProvider());
	}

	/**
	 * Configure XR part with configurations
	 *
	 * @param {XROptions} config - Configuration for XR
	 * @return {Object} - The current configuration
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	configure(options: XROptions) {
		const opt = options ? options.XR || options : {};
		logger.debug('configure XR', { opt });

		this._options = Object.assign({}, this._options, opt);

		Object.entries(this._pluggables).map(([name, provider]) => {
			if (name === this._defaultProvider && !opt[this._defaultProvider]) {
				provider.configure(this._options);
			} else {
				provider.configure(this._options[name]);
			}
		});

		return this._options;
	}

	/**
	 * add plugin into XR category
	 * @param {Object} pluggable - an instance of the plugin
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public async addPluggable(pluggable: XRProvider) {
		if (pluggable && pluggable.getCategory() === 'XR') {
			this._pluggables[pluggable.getProviderName()] = pluggable;
			const config = pluggable.configure(this._options);

			return config;
		}
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public async loadScene(
		sceneName: string,
		domElementId: string,
		sceneOptions: SceneOptions = {},
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return await this._pluggables[provider].loadScene(
			sceneName,
			domElementId,
			sceneOptions
		);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public isSceneLoaded(
		sceneName: string,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].isSceneLoaded(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public getSceneController(
		sceneName: string,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].getSceneController(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public isVRCapable(
		sceneName: string,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].isVRCapable(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public isVRPresentationActive(
		sceneName: string,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].isVRPresentationActive(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public start(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].start(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public enterVR(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].enterVR(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public exitVR(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].exitVR(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public isMuted(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].isMuted(sceneName);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public setMuted(
		sceneName: string,
		muted: boolean,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].setMuted(sceneName, muted);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public onSceneEvent(
		sceneName: string,
		eventName: string,
		eventHandler: Function,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].onSceneEvent(
			sceneName,
			eventName,
			eventHandler
		);
	}

	/**
	 * @deprecated The Amazon Sumerian service is no longer accepting new customers. Existing customer scenes will not be
	 * available after February 21, 2023. The AWS Amplify XR features depend on the Amazon Sumerian service to function
	 * and as a result, will no longer be available.
	 */
	public enableAudio(
		sceneName: string,
		provider: string = this._defaultProvider
	) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].enableAudio(sceneName);
	}
}

export const XR = new XRClass(null);
Amplify.register(XR);
