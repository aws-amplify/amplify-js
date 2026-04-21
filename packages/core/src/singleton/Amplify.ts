// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_SYMBOL, Hub } from '../Hub';
import { deepFreeze } from '../utils';
import { parseAmplifyConfig } from '../libraryUtils';

import {
	AmplifyOutputsUnknown,
	LegacyConfig,
	LibraryOptions,
	ResourcesConfig,
} from './types';
import { AmplifyContext } from './AmplifyContext';
import { AuthClass } from './Auth';
import { AMPLIFY_CONTEXT_BRAND } from './contextBrand';
import { setGlobalContext } from './globalContext';

export class AmplifyClass {
	private isConfigured = false;

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
		resourcesConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
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

		// Warn if Pinpoint is configured
		if (
			this.resourcesConfig.Analytics?.Pinpoint ||
			this.resourcesConfig.Notifications?.InAppMessaging?.Pinpoint ||
			this.resourcesConfig.Notifications?.PushNotification?.Pinpoint
		) {
			// eslint-disable-next-line no-console
			console.warn(
				'AWS will end support for Amazon Pinpoint on October 30, 2026. ' +
					'The guidance is to use AWS End User Messaging for push notifications and SMS, ' +
					'Amazon Simple Email Service for sending emails, Amazon Connect for campaigns, journeys, endpoints, and engagement analytics. ' +
					'Pinpoint recommends Amazon Kinesis for event collection and mobile analytics.',
			);
		}

		this.isConfigured = true;

		// Publish a branded AmplifyContext so that context-based APIs
		// (fetchAuthSession, clearCredentials) can resolve the global context.
		// Must be set BEFORE Hub.dispatch so listeners can call getActiveContext().
		const ctx: AmplifyContext = {
			resourcesConfig: this.resourcesConfig,
			libraryOptions: this.libraryOptions,
			fetchAuthSession: (options?) => this.Auth.fetchAuthSession(options ?? {}),
			clearCredentials: () => this.Auth.clearCredentials(),
			getTokens: options => this.Auth.getTokens(options),
		};

		Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
			value: true,
			enumerable: false,
			configurable: false,
			writable: false,
		});

		Object.freeze(ctx);
		setGlobalContext(ctx);

		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: this.resourcesConfig,
			},
			'Configure',
			AMPLIFY_SYMBOL,
		);
	}

	/**
	 * Provides access to the current back-end resource configuration for the Library.
	 *
	 * @returns Returns the immutable back-end resource configuration.
	 */
	getConfig(): Readonly<ResourcesConfig> {
		if (!this.isConfigured) {
			// eslint-disable-next-line no-console
			console.warn(
				`Amplify has not been configured. Please call Amplify.configure() before using this service.`,
			);
		}

		return this.resourcesConfig;
	}
}

/**
 * The `Amplify` utility is used to configure the library.
 *
 * @remarks
 * `Amplify` orchestrates cross-category communication within the library.
 */
export const Amplify = new AmplifyClass();
