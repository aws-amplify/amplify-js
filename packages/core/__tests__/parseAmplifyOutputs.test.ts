import { AmplifyOutputs, parseAmplifyOutputs } from '../src/libraryUtils';

describe('parseGen2Config tests', () => {
	describe('auth tests', () => {
		it('should parse auth happy path (all enabled)', () => {
			const gen2Config: AmplifyOutputs = {
				'version': '1',
				'auth': {
					'user_pool_id': 'us-east-1:',
					'user_pool_client_id': 'xxxx',
					'aws_region': 'us-east-1',
					'identity_pool_id': 'test',
					'oauth': {
						domain: 'https://cognito.com...',
						redirect_sign_in_uri: ['http://localhost:3000/welcome'],
						redirect_sign_out_uri: ['http://localhost:3000/come-back-soon'],
						response_type: 'code',
						scopes: ['profile', '...'],
						identity_providers: ['GOOGLE'],
					},
					'password_policy': {
						'min_length': 8,
						'require_lowercase': true,
						'require_uppercase': true,
						'require_symbols': true,
						'require_numbers': true
					},
					'standard_required_attributes': ['email'],
					'username_attributes': ['EMAIL'],
					'user_verification_mechanisms': ['EMAIL'],
					'unauthenticated_identities_enabled': true,
					'mfa_configuration': 'OPTIONAL',
					'mfa_methods': ['SMS']
				},
			};

			const result = parseAmplifyOutputs(gen2Config);
			expect(result).toEqual({
				'Auth': {
					'Cognito': {
						'allowGuestAccess': true,
						'identityPoolId': 'test',
						'mfa': {
							'smsEnabled': true,
							'status': 'optional',
							'totpEnabled': false,
						},
						'passwordFormat': {
							'minLength': 8,
							'requireLowercase': true,
							'requireNumbers': true,
							'requireSpecialCharacters': true,
							'requireUppercase': true,
						},
						'userAttributes': {
							'email': {
								'required': true,
							},
						},
						'userPoolClientId': 'xxxx',
						'userPoolId': 'us-east-1:',
						'loginWith': {
							'email': true,
							'oauth': {
								'domain': 'https://cognito.com...',
								'providers': [
									'Google',
								],
								'redirectSignIn': [
									'http://localhost:3000/welcome',
								],
								'redirectSignOut': [
									'http://localhost:3000/come-back-soon',
								],
								'responseType': 'code',
								'scopes': [
									'profile',
									'...',
								]
							}
						}
					}
				}
			});
		});
	});

	describe('storage tests', () => {
		it('should parse storage happy path', () => {
			const gen2Config: AmplifyOutputs = {
				'version': '1',
				'storage': {
					aws_region: 'us-west-2',
					bucket_name: 'storage-bucket-test'
				}
			};

			const result = parseAmplifyOutputs(gen2Config);

			expect(result).toEqual({
				Storage: {
					S3: {
						'bucket': 'storage-bucket-test',
						'region': 'us-west-2',
					}
				}
			})
		})
	});

	describe('analytics tests', () => {
		it('should parse all providers', () => {
			const gen2Config: AmplifyOutputs = {
				'version': '1',
				'analytics': {
					amazon_pinpoint: {
						app_id: 'xxxxx',
						aws_region: 'us-east-1'
					}
				}
			};

			const result = parseAmplifyOutputs(gen2Config);

			expect(result).toEqual({
				'Analytics': {
					'Pinpoint': {
						'appId': 'xxxxx',
						'region': 'us-east-1',
					}
				}
			})
		});
	});

	describe('geo tests', () => {
		it('should parse LocationService config', () => {
			const gen2Config: AmplifyOutputs = {
				'version': '1',
				'geo': {
					aws_region: 'us-east-1',
					maps: {
						items: {
							'map1': { name: 'map1', style: 'color' }
						},
						default: 'map1'
					},
					geofence_collections: {
						items: ['a', 'b', 'c'],
						default: 'a'
					},
					search_indices: {
						items: ['a', 'b', 'c'],
						default: 'a'
					}
				}
			};
			const result = parseAmplifyOutputs(gen2Config);
			expect(result).toEqual({
				'Geo': {
					'LocationService': {
						'geofenceCollections': {
							'default': 'a',
							'items': [
								'a',
								'b',
								'c',
							],
						},
						'maps': {
							'default': 'map1',
							'items': {
								'map1': {
									style: 'color',
									name: 'map1'
								},
							},
						},
						'region': 'us-east-1',
						'searchIndices': {
							'default': 'a',
							'items': [
								'a',
								'b',
								'c',
							],
						},
					},
				}
			})
		})

	});

	describe('data tests', () => {
		it('should configure data', () => {
			const gen2Config: AmplifyOutputs = {
				'version': '1',
				'data': {
					aws_region: 'us-west-2',
					url: 'https://api.appsyncaws.com/graphql',
					authorization_types: ['API_KEY'],
					default_authorization_type: 'API_KEY',
					api_key: 'da-xxxx'
				}
			};

			const result = parseAmplifyOutputs(gen2Config);
			expect(result).toEqual({
				API: {
					'GraphQL': {
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
				const gen2Config: AmplifyOutputs = {
					'version': '1',
					'notifications': {
						aws_region: 'us-west-2',
						pinpoint_app_id: 'appid123',
						channels: ['APNS', 'EMAIL', 'FCM', 'IN_APP_MESSAGING', 'SMS'],
					}
				};

				const result = parseAmplifyOutputs(gen2Config);
				expect(result).toEqual({
					'Notifications': {
						'InAppMessaging': {
							'Pinpoint': {
								'appId': 'appid123',
								'region': 'us-west-2',
							},
						},
						'PushNotification': {
							'Pinpoint': {
								'appId': 'appid123',
								'region': 'us-west-2',
							},
						}
					}
				});
			});
		})
	})
})
