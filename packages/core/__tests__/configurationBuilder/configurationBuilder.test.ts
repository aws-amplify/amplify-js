// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createConfigurationBuilder } from '../../src';

describe('createConfigurationBuilder', () => {
	describe('basic builder', () => {
		it('returns a builder object with from/add/patch/build methods', () => {
			const builder = createConfigurationBuilder();
			expect(builder.from).toBeDefined();
			expect(builder.add).toBeDefined();
			expect(builder.patch).toBeDefined();
			expect(builder.build).toBeDefined();
		});

		it('build() returns empty frozen config when nothing added', () => {
			const config = createConfigurationBuilder().build();
			expect(config).toEqual({});
			expect(Object.isFrozen(config)).toBe(true);
		});
	});

	describe('.add(category, value)', () => {
		it('sets a category config', () => {
			const config = createConfigurationBuilder()
				.add('Auth', {
					Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
				})
				.build();
			expect(config.Auth).toEqual({
				Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
			});
		});

		it('replaces existing category config entirely', () => {
			const config = createConfigurationBuilder()
				.add('Auth', {
					Cognito: { userPoolId: 'a', userPoolClientId: 'b' },
				})
				.add('Auth', {
					Cognito: { userPoolId: 'c', userPoolClientId: 'd' },
				})
				.build();
			expect(config.Auth?.Cognito?.userPoolId).toBe('c');
		});

		it('returns the builder for chaining', () => {
			const builder = createConfigurationBuilder();
			expect(
				builder.add('Auth', {
					Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
				}),
			).toBe(builder);
		});
	});

	describe('.patch(category, value)', () => {
		it('deep-merges partial config into existing category', () => {
			const config = createConfigurationBuilder()
				.add('Auth', {
					Cognito: {
						userPoolId: 'pool',
						userPoolClientId: 'client',
						identityPoolId: 'id',
					},
				})
				.patch('Auth', { Cognito: { userPoolId: 'new-pool' } })
				.build();
			expect(config.Auth?.Cognito?.userPoolId).toBe('new-pool');
			expect(config.Auth?.Cognito?.userPoolClientId).toBe('client');
		});

		it('creates category if it does not exist', () => {
			const config = createConfigurationBuilder()
				.patch('Auth', {
					Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
				})
				.build();
			expect(config.Auth).toBeDefined();
		});

		it('handles category configuration by replacing (not merging)', () => {
			const config = createConfigurationBuilder()
				.add('API', {
					REST: {
						myApi: {
							endpoint: 'https://api.example.com',
							region: 'us-east-1',
						},
					},
				})
				.patch('API', {
					REST: {
						myApi: {
							endpoint: 'https://api2.example.com',
						},
					},
				})
				.build();
			expect(config.API?.REST?.myApi?.endpoint).toBe(
				'https://api2.example.com',
			);
			expect(config.API?.REST?.myApi.region).toBe('us-east-1');
		});

		it('returns the builder for chaining', () => {
			const builder = createConfigurationBuilder();
			expect(
				builder.patch('Auth', {
					Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
				}),
			).toBe(builder);
		});
	});

	describe('.from(seed)', () => {
		it('merges a ResourcesConfig seed', () => {
			const seed = {
				Auth: { Cognito: { userPoolId: 'x', userPoolClientId: 'y' } },
			};
			const config = createConfigurationBuilder().from(seed).build();
			expect(config.Auth).toEqual(seed.Auth);
		});

		it('merges a legacy config seed (parsed via parseAmplifyConfig)', () => {
			const legacy = {
				aws_project_region: 'us-east-1',
				aws_user_pools_id: 'pool',
				aws_user_pools_web_client_id: 'client',
			};
			const config = createConfigurationBuilder()
				.from(legacy as any)
				.build();
			expect(config.Auth?.Cognito?.userPoolId).toBe('pool');
		});

		it('merges another ConfigurationBuilder as seed', () => {
			const base = createConfigurationBuilder().add('Auth', {
				Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
			});
			const config = createConfigurationBuilder().from(base).build();
			expect(config.Auth).toBeDefined();
		});

		it('can be called multiple times (accumulates)', () => {
			const config = createConfigurationBuilder()
				.from({
					Auth: {
						Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
					},
				})
				.from({ Storage: { S3: { bucket: 'my-bucket', region: 'us-east-1' } } })
				.build();
			expect(config.Auth).toBeDefined();
			expect(config.Storage).toBeDefined();
		});

		it('returns the builder for chaining', () => {
			const builder = createConfigurationBuilder();
			expect(
				builder.from({
					Auth: {
						Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
					},
				}),
			).toBe(builder);
		});
	});

	describe('createConfigurationBuilder({ from })', () => {
		it('accepts initial seed via options', () => {
			const config = createConfigurationBuilder({
				from: {
					Auth: {
						Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
					},
				},
			}).build();
			expect(config.Auth).toBeDefined();
		});

		it('accepts a ConfigurationBuilder as initial seed', () => {
			const base = createConfigurationBuilder().add('Auth', {
				Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
			});
			const config = createConfigurationBuilder({ from: base }).build();
			expect(config.Auth).toBeDefined();
		});
	});

	describe('category shorthands', () => {
		it('.auth() is equivalent to .add("Auth", ...)', () => {
			const a = createConfigurationBuilder()
				.auth({ Cognito: { userPoolId: 'pool', userPoolClientId: 'client' } })
				.build();
			const b = createConfigurationBuilder()
				.add('Auth', {
					Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
				})
				.build();
			expect(a).toEqual(b);
		});

		it('.storage() is equivalent to .add("Storage", ...)', () => {
			const a = createConfigurationBuilder()
				.storage({ S3: { bucket: 'my-bucket', region: 'us-east-1' } })
				.build();
			const b = createConfigurationBuilder()
				.add('Storage', { S3: { bucket: 'my-bucket', region: 'us-east-1' } })
				.build();
			expect(a).toEqual(b);
		});

		it('.api() is equivalent to .add("API", ...)', () => {
			const a = createConfigurationBuilder()
				.api({
					REST: {
						myApi: { endpoint: 'https://api.example.com', region: 'us-east-1' },
					},
				})
				.build();
			const b = createConfigurationBuilder()
				.add('API', {
					REST: {
						myApi: { endpoint: 'https://api.example.com', region: 'us-east-1' },
					},
				})
				.build();
			expect(a).toEqual(b);
		});

		it('.analytics() is equivalent to .add("Analytics", ...)', () => {
			const a = createConfigurationBuilder()
				.analytics({
					Pinpoint: {
						appId: 'app-id',
						region: 'us-east-1',
					},
				})
				.build();
			const b = createConfigurationBuilder()
				.add('Analytics', {
					Pinpoint: {
						appId: 'app-id',
						region: 'us-east-1',
					},
				})
				.build();
			expect(a).toEqual(b);
		});

		it('.geo() is equivalent to .add("Geo", ...)', () => {
			const a = createConfigurationBuilder()
				.geo({
					LocationService: {
						maps: { items: {}, default: 'map1' },
						region: 'us-east-1',
					},
				})
				.build();
			const b = createConfigurationBuilder()
				.add('Geo', {
					LocationService: {
						maps: { items: {}, default: 'map1' },
						region: 'us-east-1',
					},
				})
				.build();
			expect(a).toEqual(b);
		});

		it('.notifications() is equivalent to .add("Notifications", ...)', () => {
			const a = createConfigurationBuilder()
				.notifications({
					PushNotification: {
						Pinpoint: { appId: 'app-id', region: 'us-east-1' },
					},
				})
				.build();
			const b = createConfigurationBuilder()
				.add('Notifications', {
					PushNotification: {
						Pinpoint: { appId: 'app-id', region: 'us-east-1' },
					},
				})
				.build();
			expect(a).toEqual(b);
		});

		it('.interactions() is equivalent to .add("Interactions", ...)', () => {
			const a = createConfigurationBuilder()
				.interactions({
					LexV2: {
						'bot-alias': {
							aliasId: 'alias-id',
							botId: 'bot-id',
							localeId: 'en_US',
							region: 'us-east-1',
						},
					},
				})
				.build();
			const b = createConfigurationBuilder()
				.add('Interactions', {
					LexV2: {
						'bot-alias': {
							aliasId: 'alias-id',
							botId: 'bot-id',
							localeId: 'en_US',
							region: 'us-east-1',
						},
					},
				})
				.build();
			expect(a).toEqual(b);
		});

		it('.predictions() is equivalent to .add("Predictions", ...)', () => {
			const a = createConfigurationBuilder()
				.predictions({
					convert: {
						translateText: {
							region: 'us-east-1',
							defaults: { sourceLanguage: 'en', targetLanguage: 'es' },
						},
					},
				})
				.build();
			const b = createConfigurationBuilder()
				.add('Predictions', {
					convert: {
						translateText: {
							region: 'us-east-1',
							defaults: { sourceLanguage: 'en', targetLanguage: 'es' },
						},
					},
				})
				.build();
			expect(a).toEqual(b);
		});
	});

	describe('.build()', () => {
		it('returns a frozen object', () => {
			const config = createConfigurationBuilder()
				.add('Auth', {
					Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
				})
				.build();
			expect(Object.isFrozen(config)).toBe(true);
		});

		it('returns a shallow copy — mutations to internal state do not affect built config', () => {
			const builder = createConfigurationBuilder().add('Auth', {
				Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
			});
			const config1 = builder.build();
			builder.add('Storage', {
				S3: { bucket: 'my-bucket', region: 'us-east-1' },
			});
			const config2 = builder.build();
			expect(config1.Storage).toBeUndefined();
			expect(config2.Storage).toBeDefined();
		});

		it('can be called multiple times', () => {
			const builder = createConfigurationBuilder().add('Auth', {
				Cognito: { userPoolId: 'pool', userPoolClientId: 'client' },
			});
			const a = builder.build();
			const b = builder.build();
			expect(a).toEqual(b);
			expect(a).not.toBe(b);
		});
	});
});
