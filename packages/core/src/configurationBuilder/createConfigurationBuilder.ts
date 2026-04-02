// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyOutputsAnalyticsProperties,
	AmplifyOutputsAuthProperties,
	AmplifyOutputsCustomProperties,
	AmplifyOutputsGeoProperties,
	AmplifyOutputsNotificationsProperties,
	AmplifyOutputsStorageProperties,
} from '../singleton/AmplifyOutputs/types';

interface AmplifyOutputsDataProperties {
	aws_region: string;
	url: string;
	default_authorization_type: string;
	authorization_types: string[];
	model_introspection?: object;
	api_key?: string;
}

/**
 * The shape produced by `.build()` — conforms to amplify_outputs.json schema v1.4.
 */
export interface AmplifyOutputsConfig {
	version: '1.4';
	auth?: AmplifyOutputsAuthProperties;
	storage?: AmplifyOutputsStorageProperties;
	data?: AmplifyOutputsDataProperties;
	analytics?: AmplifyOutputsAnalyticsProperties;
	geo?: AmplifyOutputsGeoProperties;
	notifications?: AmplifyOutputsNotificationsProperties;
	custom?: AmplifyOutputsCustomProperties;
}

export interface ConfigurationBuilder {
	/**
	 * Merge an existing config into this builder. Last write wins —
	 * subsequent `.auth()`, `.storage()`, etc. calls override values set by `from()`.
	 *
	 * @example
	 * ```ts
	 * const authConfig = createConfigurationBuilder().auth({...}).build();
	 * const fullConfig = createConfigurationBuilder().from(authConfig).storage({...}).build();
	 * // fullConfig has both auth and storage
	 * ```
	 */
	from(existing: Partial<AmplifyOutputsConfig>): ConfigurationBuilder;
	auth(config: AmplifyOutputsAuthProperties): ConfigurationBuilder;
	storage(config: AmplifyOutputsStorageProperties): ConfigurationBuilder;
	data(config: AmplifyOutputsDataProperties): ConfigurationBuilder;
	analytics(config: AmplifyOutputsAnalyticsProperties): ConfigurationBuilder;
	geo(config: AmplifyOutputsGeoProperties): ConfigurationBuilder;
	notifications(
		config: AmplifyOutputsNotificationsProperties,
	): ConfigurationBuilder;
	custom(config: AmplifyOutputsCustomProperties): ConfigurationBuilder;
	build(): AmplifyOutputsConfig;
}

/**
 * Creates a fluent builder for constructing `amplify_outputs.json`-compatible
 * configuration objects programmatically.
 *
 * @example
 * ```ts
 * const config = createConfigurationBuilder()
 *   .auth({ user_pool_id: 'us-east-1_abc', user_pool_client_id: 'xyz', aws_region: 'us-east-1' })
 *   .storage({ bucket_name: 'my-bucket', aws_region: 'us-east-1' })
 *   .build();
 *
 * const ctx = configure(config);
 * ```
 */
export function createConfigurationBuilder(): ConfigurationBuilder {
	const config: Omit<AmplifyOutputsConfig, 'version'> = {};

	const builder: ConfigurationBuilder = {
		from(existing) {
			if (existing.auth) config.auth = existing.auth;
			if (existing.storage) config.storage = existing.storage;
			if (existing.data) config.data = existing.data;
			if (existing.analytics) config.analytics = existing.analytics;
			if (existing.geo) config.geo = existing.geo;
			if (existing.notifications) config.notifications = existing.notifications;
			if (existing.custom) config.custom = existing.custom;

			return builder;
		},
		auth(value) {
			config.auth = value;

			return builder;
		},
		storage(value) {
			config.storage = value;

			return builder;
		},
		data(value) {
			config.data = value;

			return builder;
		},
		analytics(value) {
			config.analytics = value;

			return builder;
		},
		geo(value) {
			config.geo = value;

			return builder;
		},
		notifications(value) {
			config.notifications = value;

			return builder;
		},
		custom(value) {
			config.custom = value;

			return builder;
		},
		build(): AmplifyOutputsConfig {
			return Object.freeze({ version: '1.4', ...config });
		},
	};

	return builder;
}
