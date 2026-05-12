// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LegacyConfig, ResourcesConfig } from '../singleton/types';
import { AmplifyOutputsUnknown } from '../singleton/AmplifyOutputs/types';
import { parseAmplifyConfig } from '../utils/parseAmplifyConfig';

/**
 * Supported category names for `.add()`.
 */
type CategoryName = keyof ResourcesConfig;

/**
 * Maps a category name to its config type.
 */
type CategoryConfig<K extends CategoryName> = NonNullable<ResourcesConfig[K]>;

/**
 * Allowed seed formats for `createConfiguration({ from })`.
 */
type ConfigurationSeed =
	| ResourcesConfig
	| LegacyConfig
	| AmplifyOutputsUnknown
	| ConfigurationBuilder;

/**
 * Recursively makes all properties optional.
 */
type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;

export interface ConfigurationBuilder {
	/**
	 * Merge an existing config into this builder. Accepts any format that
	 * `Amplify.configure()` accepts, or another `ConfigurationBuilder`.
	 *
	 * @example
	 * ```ts
	 * const config = createConfiguration()
	 *   .from(amplifyOutputs)
	 *   .add('Storage', { S3: { bucket: 'my-bucket', region: 'us-east-1' } })
	 *   .build();
	 * ```
	 */
	from(existing: ConfigurationSeed): ConfigurationBuilder;

	/**
	 * Add or replace a category configuration.
	 *
	 * @example
	 * ```ts
	 * config.add('Auth', { Cognito: { userPoolId: '...', userPoolClientId: '...' } });
	 * config.add('Storage', { S3: { bucket: '...', region: '...' } });
	 * ```
	 */
	add<K extends CategoryName>(
		category: K,
		value: CategoryConfig<K>,
	): ConfigurationBuilder;

	/**
	 * Deep-merge a partial config into an existing category. Use this to
	 * override specific nested values without replacing the entire category.
	 *
	 * @example
	 * ```ts
	 * // Base config from outputs, override just the user pool for dev
	 * const dev = createConfiguration({ from: outputs })
	 *   .patch('Auth', { Cognito: { userPoolId: 'us-east-1_DEV' } })
	 *   .build();
	 * ```
	 */
	patch<K extends CategoryName>(
		category: K,
		value: DeepPartial<CategoryConfig<K>>,
	): ConfigurationBuilder;

	/** Shorthand for `.add('Auth', config)` */
	auth(config: CategoryConfig<'Auth'>): ConfigurationBuilder;
	/** Shorthand for `.add('Storage', config)` */
	storage(config: CategoryConfig<'Storage'>): ConfigurationBuilder;
	/** Shorthand for `.add('API', config)` */
	api(config: CategoryConfig<'API'>): ConfigurationBuilder;
	/** Shorthand for `.add('Analytics', config)` */
	analytics(config: CategoryConfig<'Analytics'>): ConfigurationBuilder;
	/** Shorthand for `.add('Geo', config)` */
	geo(config: CategoryConfig<'Geo'>): ConfigurationBuilder;
	/** Shorthand for `.add('Notifications', config)` */
	notifications(config: CategoryConfig<'Notifications'>): ConfigurationBuilder;
	/** Shorthand for `.add('Interactions', config)` */
	interactions(config: CategoryConfig<'Interactions'>): ConfigurationBuilder;
	/** Shorthand for `.add('Predictions', config)` */
	predictions(config: CategoryConfig<'Predictions'>): ConfigurationBuilder;

	/**
	 * Produces a frozen `ResourcesConfig` ready for `Amplify.configure()`.
	 */
	build(): ResourcesConfig;
}

export interface CreateConfigurationBuilderOptions {
	from?: ConfigurationSeed;
}

/**
 * Creates a configuration builder for constructing `ResourcesConfig` objects
 * programmatically.
 *
 * @example
 * ```ts
 * import outputs from './amplify_outputs.json';
 *
 * const config = createConfiguration({ from: outputs })
 *   .add('Storage', { S3: { bucket: 'my-bucket', region: 'us-east-1' } })
 *   .build();
 *
 * Amplify.configure(config);
 * ```
 */
export function createConfigurationBuilder(
	options?: CreateConfigurationBuilderOptions,
): ConfigurationBuilder {
	const config: ResourcesConfig = {};

	function mergeFrom(seed: ConfigurationSeed): void {
		const resolved: ResourcesConfig =
			'build' in seed && typeof seed.build === 'function'
				? seed.build()
				: parseAmplifyConfig(
						seed as ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
					);

		Object.assign(config, resolved);
	}

	if (options?.from) {
		mergeFrom(options.from);
	}

	const builder: ConfigurationBuilder = {
		from(existing) {
			mergeFrom(existing);

			return builder;
		},
		add(category, value) {
			(config as Record<string, unknown>)[category] = value;

			return builder;
		},
		patch(category, value) {
			const existing = (config as Record<string, unknown>)[category];
			(config as Record<string, unknown>)[category] = deepMerge(
				existing ?? {},
				value,
			);

			return builder;
		},
		auth(value) {
			return builder.add('Auth', value);
		},
		storage(value) {
			return builder.add('Storage', value);
		},
		api(value) {
			return builder.add('API', value);
		},
		analytics(value) {
			return builder.add('Analytics', value);
		},
		geo(value) {
			return builder.add('Geo', value);
		},
		notifications(value) {
			return builder.add('Notifications', value);
		},
		interactions(value) {
			return builder.add('Interactions', value);
		},
		predictions(value) {
			return builder.add('Predictions', value);
		},
		build(): ResourcesConfig {
			return Object.freeze({ ...config });
		},
	};

	return builder;
}

function deepMerge(target: unknown, source: unknown): unknown {
	if (
		typeof target !== 'object' ||
		typeof source !== 'object' ||
		target === null ||
		source === null ||
		Array.isArray(target) ||
		Array.isArray(source)
	) {
		return source;
	}

	const result: Record<string, unknown> = {
		...(target as Record<string, unknown>),
	};

	for (const key of Object.keys(source as Record<string, unknown>)) {
		const sourceVal = (source as Record<string, unknown>)[key];
		const targetVal = result[key];

		result[key] =
			typeof targetVal === 'object' &&
			typeof sourceVal === 'object' &&
			targetVal !== null &&
			sourceVal !== null &&
			!Array.isArray(targetVal) &&
			!Array.isArray(sourceVal)
				? deepMerge(targetVal, sourceVal)
				: sourceVal;
	}

	return result;
}
