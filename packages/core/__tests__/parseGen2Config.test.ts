import { Gen2Config, parseGen2Config } from "../src/libraryUtils";

describe('parseGen2Config tests', () => {
	describe('auth tests', () => {
		it('should parse auth happy path (all enabled)', () => {
			const gen2Config: Gen2Config = {
				"$id": "https://amplify.aws/2024-02/outputs-schema.json",
				"auth": {
					"user_pool_id": 'us-east-1:',
					"user_pool_client_id": "xxxx",
					"aws_region": "us-east-1",
					"identity_pool_id": "test",
					"oauth_domain": "https://cognito.com...",
					"oauth_redirect_sign_in": ["http://localhost:3000/welcome"],
					"oauth_redirect_sign_out": ["http://localhost:3000/come-back-soon"],
					"oauth_response_type": "code",
					"oauth_scopes": ["profile", "..."],
					"password_policy": {
						"min_length": 8,
						"require_lowercase": true,
						"require_uppercase": true,
						"require_symbols": true,
						"require_numbers": true
					},
					"identity_providers": ["Google", "Midway"],
					"standard_attributes": {
						"email": {
							"required": true
						}
					},
					"username_attributes": ["EMAIL"],
					"user_verification_mechanisms": ["EMAIL"],
					"unauthenticated_identities_enabled": true,
					"mfa_configuration": "OPTIONAL",
					"mfa_methods": ["SMS"]
				},
			};

			const result = parseGen2Config(gen2Config);
			expect(result).toEqual({
				"Auth": {
					"Cognito": {
						"allowGuestAccess": true,
						"identityPoolId": "test",
						"mfa": {
							"smsEnabled": true,
							"status": "optional",
							"totpEnabled": false,
						},
						"passwordFormat": {
							"minLength": 8,
							"requireLowercase": true,
							"requireNumbers": true,
							"requireSpecialCharacters": true,
							"requireUppercase": true,
						},
						"userAttributes": {
							"email": {
								"required": true,
							},
						},
						"userPoolClientId": "xxxx",
						"userPoolId": "us-east-1:",
					}
				}
			});
		});
	});

	describe('storage tests', () => {
		it('should parse storage happy path', () => {
			const gen2Config: Gen2Config = {
				"$id": "https://amplify.aws/2024-02/outputs-schema.json",
				"storage": {
					aws_region: 'us-west-2',
					name: 'storage-bucket-test'
				}
			};

			const result = parseGen2Config(gen2Config);

			expect(result).toEqual({
				Storage: {
					S3: {
						"bucket": "storage-bucket-test",
						"region": "us-west-2",
					}
				}
			})
		})
	});

	describe('analytics tests', () => {
		it('should parse all providers', () => {
			const gen2Config: Gen2Config = {
				"$id": "https://amplify.aws/2024-02/outputs-schema.json",
				"analytics": {
					amazon_pinpoint: {
						app_id: 'xxxxx',
						aws_region: 'us-east-1'
					},
					amazon_kinesis: {
						aws_region: 'us-west-2',
						buffer_size: 10,
						flush_interval: 1000,
						flush_size: 100,
						resend_limit: 10
					},
					amazon_kinesis_firehose: {
						aws_region: 'us-west-1',
						buffer_size: 9,
						flush_interval: 999,
						flush_size: 99,
						resend_limit: 9
					}
				}
			};

			const result = parseGen2Config(gen2Config);

			expect(result).toEqual({
				"Analytics": {
					"Pinpoint": {
						"appId": "xxxxx",
						"region": "us-east-1",
					},
					"Kinesis": {
						"bufferSize": 10,
						"flushInterval": 1000,
						"flushSize": 100,
						"region": "us-west-2",
						"resendLimit": 10,
					},
					"KinesisFirehose": {
						"bufferSize": 9,
						"flushInterval": 999,
						"flushSize": 99,
						"region": "us-west-1",
						"resendLimit": 9,
					}
				}
			})
		});
	});

	describe('geo tests', () => {
		it('should parse LocationService config', () => {
			const gen2Config: Gen2Config = {
				"$id": "https://amplify.aws/2024-02/outputs-schema.json",
				"geo": {
					aws_region: 'us-east-1',
					maps: {
						items: [{ name: 'map1', style: 'color' }],
						default: 'map1'
					},
					geofence_collections: {
						items: ["a", "b", "c"],
						default: "a"
					},
					search_indices: {
						items: ["a", "b", "c"],
						default: "a"
					}
				}
			};
			const result = parseGen2Config(gen2Config);
			expect(result).toEqual({
				"Geo": {
					"LocationService": {
						"geofenceCollections": {
							"default": "a",
							"items": [
								"a",
								"b",
								"c",
							],
						},
						"maps": {
							"default": "map1",
							"items": {
								"map1": "color",
							},
						},
						"region": "us-east-1",
						"searchIndices": {
							"default": "a",
							"items": [
								"a",
								"b",
								"c",
							],
						},
					},
				}
			})
		})

	});

	describe('api tests', () => {
		it('should configure multiple endpoints', () => {
			const gen2Config: Gen2Config = {
				"$id": "https://amplify.aws/2024-02/outputs-schema.json",
				"api": {
					endpoints: [
						{
							name: 'api1',
							url: 'https://api1.amazonapigw.com/',
							aws_region: 'us-east-1',
							authorization_types: ['AWS_IAM'],
							default_authorization_type: 'AWS_IAM'
						},
						{
							name: 'api2',
							url: 'https://api2.amazonapigw.com/',
							aws_region: 'us-east-2',
							authorization_types: ['API_KEY'],
							default_authorization_type: 'API_KEY'
						}
					]
				}
			};

			const result = parseGen2Config(gen2Config);
			expect(result).toEqual({
				API: {
					"REST": {
						"api1": {
							"endpoint": "https://api1.amazonapigw.com/",
							"region": "us-east-1",
							"service": "execute-api",
						},
						"api2": {
							"endpoint": "https://api2.amazonapigw.com/",
							"region": "us-east-2",
							"service": "execute-api",
						}
					}
				}
			});
		})
	});

	describe('data tests', () => {
		it('should configure data', () => {
			const gen2Config: Gen2Config = {
				"$id": "https://amplify.aws/2024-02/outputs-schema.json",
				"data": {
					aws_region: 'us-west-2',
					url: 'https://api.appsyncaws.com/graphql',
					authorization_types: ['API_KEY'],
					default_authorization_type: 'API_KEY',
					api_key: 'da-xxxx'
				}
			};

			const result = parseGen2Config(gen2Config);
			expect(result).toEqual({
				API: {
					"GraphQL": {
						endpoint: 'https://api.appsyncaws.com/graphql',
						region: 'us-west-2',
						apiKey: 'da-xxxx',
						defaultAuthMode: 'apiKey'
					}
				}
			});
		});

		describe('notifications tests', () => {
			it('should configure notifications', () => {
				const gen2Config: Gen2Config = {
					"$id": "https://amplify.aws/2024-02/outputs-schema.json",
					"notifications": {
						aws_region: 'us-west-2',
						pinpoint_app_id: 'appid123',
						channels: {
							in_app_messaging: {
								default: true
							},
							apns: {
								default: false
							}
						},
					}
				};

				const result = parseGen2Config(gen2Config);
				expect(result).toEqual({
					"Notifications": {
						"InAppMessaging": {
							"Pinpoint": {
								"appId": "appid123",
								"region": "us-west-2",
							},
						},
						"PushNotification": {
							"Pinpoint": {
								"appId": "appid123",
								"region": "us-west-2",
							},
						}
					}
				});
			});
		})
	})
})