// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_SYMBOL, Hub } from '../Hub';
import { deepFreeze } from '../utils';
import { parseAmplifyConfig } from '../libraryUtils';

import {
	AmplifyOutputs,
	AuthConfig,
	LegacyConfig,
	LibraryOptions,
	ResourcesConfig,
} from './types';
import { AuthClass } from './Auth';
import { ADD_OAUTH_LISTENER } from './constants';

export class AmplifyClass {
	private oAuthListener:
		| ((authConfig: AuthConfig['Cognito']) => void)
		| undefined = undefined;

	resourcesConfig: ResourcesConfig;
	libraryOptions: LibraryOptions;

	/**
	 * Cross-category Auth utilities.
	 *
	 * @internal
	 */
	public readonly Auth: AuthClass;

	constructor() {
		this.resourcesConfig = {};
		this.libraryOptions = {};
		this.Auth = new AuthClass();
	}

	/**
	 * Configures Amplify for use with your back-end resources.
	 *
	 * @remarks
	 * This API does not perform any merging of either `resourcesConfig` or `libraryOptions`. The most recently
	 * provided values will be used after configuration.
	 *
	 * @remarks
	 * `configure` can be used to specify additional library options where available for supported categories.
	 *
	 * @param resourceConfig - Back-end resource configuration. Typically provided via the `aws-exports.js` file.
	 * @param libraryOptions - Additional options for customizing the behavior of the library.
	 */
	configure(
		resourcesConfig: ResourcesConfig | LegacyConfig | AmplifyOutputs,
		libraryOptions?: LibraryOptions,
	): void {
		const resolvedResourceConfig = parseAmplifyConfig(resourcesConfig);

		this.resourcesConfig = resolvedResourceConfig;

		if (libraryOptions) {
			this.libraryOptions = libraryOptions;
		}

		// Make resource config immutable
		this.resourcesConfig = deepFreeze(this.resourcesConfig);

		this.Auth.configure(this.resourcesConfig.Auth!, this.libraryOptions.Auth);

		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: this.resourcesConfig,
			},
			'Configure',
			AMPLIFY_SYMBOL,
		);

		this.notifyOAuthListener();
	}

	/**
	 * Provides access to the current back-end resource configuration for the Library.
	 *
	 * @returns Returns the immutable back-end resource configuration.
	 */
	getConfig(): Readonly<ResourcesConfig> {
		return this.resourcesConfig;
	}

	/** @internal */
	[ADD_OAUTH_LISTENER](listener: (authConfig: AuthConfig['Cognito']) => void) {
		if (this.resourcesConfig.Auth?.Cognito.loginWith?.oauth) {
			// when Amplify has been configured with a valid OAuth config while adding the listener, run it directly
			listener(this.resourcesConfig.Auth?.Cognito);
		} else {
			// otherwise register the listener and run it later when Amplify gets configured with a valid oauth config
			this.oAuthListener = listener;
		}
	}

	private notifyOAuthListener() {
		if (
			!this.resourcesConfig.Auth?.Cognito.loginWith?.oauth ||
			!this.oAuthListener
		) {
			return;
		}

		this.oAuthListener(this.resourcesConfig.Auth?.Cognito);
		// the listener should only be notified once with a valid oauth config
		this.oAuthListener = undefined;
	}
}

/**
 * The `Amplify` utility is used to configure the library.
 *
 * @remarks
 * `Amplify` orchestrates cross-category communication within the library.
 */
export const Amplify = new AmplifyClass();
