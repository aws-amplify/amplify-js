// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthClass } from './Auth';
import { Hub, AMPLIFY_SYMBOL } from '../Hub';
import { LegacyConfig, LibraryOptions, ResourcesConfig } from './types';
import { parseAWSExports } from '../parseAWSExports';
import { deepFreeze } from '../utils';

// TODO(v6): add default AuthTokenStore for each platform

export class AmplifyClass {
	resourcesConfig: ResourcesConfig;
	libraryOptions: LibraryOptions;

	/**
	 * @internal
	 */
	private cachedResourcesConfig: ResourcesConfig;

	/**
	 * @internal
	 */
	private cachedImmutableResourcesConfig: ResourcesConfig | undefined;

	/**
	 * Cross-category Auth utilities.
	 *
	 * @internal
	 */
	public readonly Auth: AuthClass;

	constructor() {
		this.resourcesConfig = {};
		this.cachedResourcesConfig = this.resourcesConfig;
		this.libraryOptions = {};
		this.Auth = new AuthClass();
	}

	/**
	 * Configures Amplify for use with your back-end resources.
	 *
	 * @remarks
	 * `configure` can be used to specify additional library options where available for supported categories.
	 *
	 * @param resourceConfig - Back-end resource configuration. Typically provided via the `aws-exports.js` file.
	 * @param libraryOptions - Additional options for customizing the behavior of the library.
	 */
	configure(
		resourcesConfig: ResourcesConfig | LegacyConfig,
		libraryOptions: LibraryOptions = {}
	): void {
		let resolvedResourceConfig: ResourcesConfig;

		if (Object.keys(resourcesConfig).some(key => key.startsWith('aws_'))) {
			resolvedResourceConfig = parseAWSExports(resourcesConfig);
		} else {
			resolvedResourceConfig = resourcesConfig as ResourcesConfig;
		}

		this.resourcesConfig = mergeResourceConfig(
			this.resourcesConfig,
			resolvedResourceConfig
		);

		this.libraryOptions = mergeLibraryOptions(
			this.libraryOptions,
			libraryOptions
		);

		this.Auth.configure(this.resourcesConfig.Auth!, this.libraryOptions.Auth);

		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: resourcesConfig,
			},
			'Configure',
			AMPLIFY_SYMBOL
		);
	}

	/**
	 * Provides access to the current back-end resource configuration for the Library.
	 *
	 * @returns Returns an immutable back-end resource configuration.
	 */
	getConfig(): ResourcesConfig {
		// Memoization contingent on `configure` creating a new object instance each time configuration changes
		if (this.cachedResourcesConfig !== this.resourcesConfig || !this.cachedImmutableResourcesConfig) {
			this.cachedResourcesConfig = this.resourcesConfig;
			this.cachedImmutableResourcesConfig = deepFreeze(JSON.parse(JSON.stringify(this.resourcesConfig)));
		}

		return this.cachedImmutableResourcesConfig!;
	}
}

/**
 * The `Amplify` utility is used to configure the library.
 *
 * @remarks
 * `Amplify` is responsible for orchestrating cross-category communication within the library.
 */
export const Amplify = new AmplifyClass();

// TODO(v6): validate until which level this will nested, during Amplify.configure API review.
function mergeResourceConfig(
	existingConfig: ResourcesConfig,
	newConfig: ResourcesConfig
): ResourcesConfig {
	const resultConfig: Record<string, any> = {};

	for (const category of Object.keys(existingConfig)) {
		resultConfig[category] = existingConfig[category as keyof ResourcesConfig];
	}

	for (const key of Object.keys(newConfig)) {
		resultConfig[key] = {
			...resultConfig[key],
			...newConfig[key as keyof ResourcesConfig],
		};
	}

	return resultConfig;
}

function mergeLibraryOptions(
	existingConfig: LibraryOptions,
	newConfig: LibraryOptions
): LibraryOptions {
	const resultConfig: Record<string, any> = {};

	for (const category of Object.keys(existingConfig)) {
		resultConfig[category] = existingConfig[category as keyof LibraryOptions];
	}

	for (const key of Object.keys(newConfig).filter(key => key !== 'ssr')) {
		resultConfig[key] = {
			...resultConfig[key],
			...newConfig[key as Exclude<keyof LibraryOptions, 'ssr'>],
		};
	}

	resultConfig.ssr = newConfig.ssr;

	return resultConfig;
}
