// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public async addPluggable(pluggable: XRProvider) {
		if (pluggable && pluggable.getCategory() === 'XR') {
			this._pluggables[pluggable.getProviderName()] = pluggable;
			const config = pluggable.configure(this._options);

			return config;
		}
	}

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

	public start(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].start(sceneName);
	}

	public enterVR(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].enterVR(sceneName);
	}

	public exitVR(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].exitVR(sceneName);
	}

	public isMuted(sceneName: string, provider: string = this._defaultProvider) {
		if (!this._pluggables[provider])
			throw new XRProviderNotConfigured(
				`Provider '${provider}' not configured`
			);
		return this._pluggables[provider].isMuted(sceneName);
	}

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
