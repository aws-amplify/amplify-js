/* eslint-disable camelcase */
import { AmplifyOutputs, parseAmplifyOutputs } from '../src/libraryUtils';
import mockAmplifyOutputs from '../__mocks__/configMocks/amplify_outputs.json';

describe('parseAmplifyOutputs tests', () => {
	describe('auth tests', () => {
		it('should parse from amplify-outputs.json', async () => {
			const result = parseAmplifyOutputs(mockAmplifyOutputs);

			expect(result).toEqual({
				API: {
					GraphQL: {
						apiKey: 'mock-data-api-key',
						defaultAuthMode: 'apiKey',
						endpoint: 'mock-data-url',
						modelIntrospection: undefined,
						region: 'us-west-2',
					},
				},
				Auth: {
					Cognito: {
						allowGuestAccess: true,
						identityPoolId: 'mock-idp-id',
						loginWith: {
							email: true,
							oauth: {
								domain: 'mock-oauth-domain',
								providers: ['Facebook', 'Apple', 'Google'],
								redirectSignIn: ['mock-sign-in-uri'],
								redirectSignOut: ['mock-sign-out-uri'],
								responseType: 'token',
								scopes: ['phone'],
							},
							phone: true,
							username: false,
						},
						mfa: {
							smsEnabled: true,
							status: 'optional',
							totpEnabled: true,
						},
						passwordFormat: {
							minLength: 6,
							requireLowercase: true,
							requireNumbers: true,
							requireSpecialCharacters: true,
							requireUppercase: true,
						},
						userAttributes: {
							address: {
								required: true,
							},
							email: {
								required: true,
							},
							locale: {
								required: true,
							},
						},
						userPoolClientId: 'mock-cup-client-id',
						userPoolId: 'mock-cup-id',
					},
				},
				Geo: {
					LocationService: {
						geofenceCollections: {
							default: 'mock-geo-fence-item',
							items: ['mock-geo-fence-item', 'mock-geo-fence-item-alt'],
						},
						maps: undefined,
						region: 'us-west-2',
						searchIndices: {
							default: 'mock-geo-search-item',
							items: ['mock-geo-search-item', 'mock-geo-search-item-alt'],
						},
					},
				},
				Storage: {
					S3: {
						bucket: 'mock-storage-bucket',
						region: 'us-west-2',
					},
				},
				Analytics: {
					Pinpoint: {
						appId: 'mock-pinpoint-app-id',
						region: 'us-west-2',
					},
				},
				Notifications: {
					InAppMessaging: {
						Pinpoint: {
							appId: 'mock-pinpoint-app-id',
							region: 'us-west-2',
						},
					},
					PushNotification: {
						Pinpoint: {
							appId: 'mock-pinpoint-app-id',
							region: 'us-west-2',
						},
					},
				},
			});
		});

		it('should parse auth happy path (all enabled)', () => {
			const amplifyOutputs = {
				version: '1',
				auth: {
					user_pool_id: 'us-east-1:',
					user_pool_client_id: 'xxxx',
					aws_region: 'us-east-1',
					identity_pool_id: 'test',
					oauth: {
						domain: 'https://cognito.com...',
						redirect_sign_in_uri: ['http://localhost:3000/welcome'],
						redirect_sign_out_uri: ['http://localhost:3000/come-back-soon'],
						response_type: 'code',
						scopes: ['profile', '...'],
						identity_providers: ['GOOGLE'],
					},
					password_policy: {
						min_length: 8,
						require_lowercase: true,
						require_uppercase: true,
						require_symbols: true,
						require_numbers: true,
					},
					standard_required_attributes: ['email'],
					username_attributes: ['email'],
					user_verification_types: ['email'],
					unauthenticated_identities_enabled: true,
					mfa_configuration: 'OPTIONAL',
					mfa_methods: ['SMS'],
					groups: [{ ADMIN: { precedence: 0 }, USER: { precedence: 0 } }],
				},
			};

			const result = parseAmplifyOutputs(amplifyOutputs);
			expect(result).toEqual({
				Auth: {
					Cognito: {
						allowGuestAccess: true,
						identityPoolId: 'test',
						mfa: {
							smsEnabled: true,
							status: 'optional',
							totpEnabled: false,
						},
						passwordFormat: {
							minLength: 8,
							requireLowercase: true,
							requireNumbers: true,
							requireSpecialCharacters: true,
							requireUppercase: true,
						},
						userAttributes: {
							email: {
								required: true,
							},
						},
						userPoolClientId: 'xxxx',
						userPoolId: 'us-east-1:',
						loginWith: {
							email: true,
							phone: false,
							username: false,
							oauth: {
								domain: 'https://cognito.com...',
								providers: ['Google'],
								redirectSignIn: ['http://localhost:3000/welcome'],
								redirectSignOut: ['http://localhost:3000/come-back-soon'],
								responseType: 'code',
								scopes: ['profile', '...'],
							},
						},
						groups: [{ ADMIN: { precedence: 0 }, USER: { precedence: 0 } }],
					},
				},
			});
		});
	});

	it('should correctly set loginWith options', () => {
		const testAmplifyOutputs = JSON.parse(JSON.stringify(mockAmplifyOutputs));

		// Phone only
		testAmplifyOutputs.auth.username_attributes = ['phone_number'];
		let result = parseAmplifyOutputs(testAmplifyOutputs);

		expect(result.Auth?.Cognito.loginWith?.email).toBe(false);
		expect(result.Auth?.Cognito.loginWith?.phone).toBe(true);
		expect(result.Auth?.Cognito.loginWith?.username).toBe(false);

		// Email only
		testAmplifyOutputs.auth.username_attributes = ['email'];
		result = parseAmplifyOutputs(testAmplifyOutputs);

		expect(result.Auth?.Cognito.loginWith?.email).toBe(true);
		expect(result.Auth?.Cognito.loginWith?.phone).toBe(false);
		expect(result.Auth?.Cognito.loginWith?.username).toBe(false);

		// Email & phone
		testAmplifyOutputs.auth.username_attributes = ['email', 'phone_number'];
		result = parseAmplifyOutputs(testAmplifyOutputs);

		expect(result.Auth?.Cognito.loginWith?.email).toBe(true);
		expect(result.Auth?.Cognito.loginWith?.phone).toBe(true);
		expect(result.Auth?.Cognito.loginWith?.username).toBe(false);
	});

	describe('storage tests', () => {
		it('should parse storage happy path', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				storage: {
					aws_region: 'us-west-2',
					bucket_name: 'storage-bucket-test',
				},
			};

			const result = parseAmplifyOutputs(amplifyOutputs);

			expect(result).toEqual({
				Storage: {
					S3: {
						bucket: 'storage-bucket-test',
						region: 'us-west-2',
					},
				},
			});
		});
		it('should parse storage multi bucket', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				storage: {
					aws_region: 'us-west-2',
					bucket_name: 'storage-bucket-test',
					buckets: [
						{
							name: 'default-bucket',
							bucket_name: 'storage-bucket-test',
							aws_region: 'us-west-2',
						},
						{
							name: 'bucket-2',
							bucket_name: 'storage-bucket-test-2',
							aws_region: 'us-west-2',
						},
					],
				},
			};

			const result = parseAmplifyOutputs(amplifyOutputs);

			expect(result).toEqual({
				Storage: {
					S3: {
						bucket: 'storage-bucket-test',
						region: 'us-west-2',
						buckets: {
							'bucket-2': {
								bucketName: 'storage-bucket-test-2',
								region: 'us-west-2',
							},
							'default-bucket': {
								bucketName: 'storage-bucket-test',
								region: 'us-west-2',
							},
						},
					},
				},
			});
		});
		it('should throw for storage multi bucket parsing with same friendly name', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				storage: {
					aws_region: 'us-west-2',
					bucket_name: 'storage-bucket-test',
					buckets: [
						{
							name: 'default-bucket',
							bucket_name: 'storage-bucket-test',
							aws_region: 'us-west-2',
						},
						{
							name: 'default-bucket',
							bucket_name: 'storage-bucket-test-2',
							aws_region: 'us-west-2',
						},
					],
				},
			};

			expect(() => parseAmplifyOutputs(amplifyOutputs)).toThrow();
		});
		it('should parse storage bucket with paths', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1.2',
				storage: {
					aws_region: 'us-west-2',
					bucket_name: 'storage-bucket-test',
					buckets: [
						{
							name: 'default-bucket',
							bucket_name: 'storage-bucket-test',
							aws_region: 'us-west-2',
							paths: {
								'other/*': {
									guest: ['get', 'list'],
									authenticated: ['get', 'list', 'write'],
								},
								'admin/*': {
									groupsauditor: ['get', 'list'],
									groupsadmin: ['get', 'list', 'write', 'delete'],
								},
							},
						},
					],
				},
			};

			const result = parseAmplifyOutputs(amplifyOutputs);

			expect(result).toEqual({
				Storage: {
					S3: {
						bucket: 'storage-bucket-test',
						region: 'us-west-2',
						buckets: {
							'default-bucket': {
								bucketName: 'storage-bucket-test',
								region: 'us-west-2',
								paths: {
									'other/*': {
										guest: ['get', 'list'],
										authenticated: ['get', 'list', 'write'],
									},
									'admin/*': {
										groupsauditor: ['get', 'list'],
										groupsadmin: ['get', 'list', 'write', 'delete'],
									},
								},
							},
						},
					},
				},
			});
		});
	});

	describe('analytics tests', () => {
		it('should parse all providers', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				analytics: {
					amazon_pinpoint: {
						app_id: 'xxxxx',
						aws_region: 'us-east-1',
					},
				},
			};

			const result = parseAmplifyOutputs(amplifyOutputs);

			expect(result).toEqual({
				Analytics: {
					Pinpoint: {
						appId: 'xxxxx',
						region: 'us-east-1',
					},
				},
			});
		});
	});

	describe('geo tests', () => {
		it('should parse LocationService config', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				geo: {
					aws_region: 'us-east-1',
					maps: {
						items: {
							map1: { style: 'color' },
						},
						default: 'map1',
					},
					geofence_collections: {
						items: ['a', 'b', 'c'],
						default: 'a',
					},
					search_indices: {
						items: ['a', 'b', 'c'],
						default: 'a',
					},
				},
			};
			const result = parseAmplifyOutputs(amplifyOutputs);
			expect(result).toEqual({
				Geo: {
					LocationService: {
						geofenceCollections: {
							default: 'a',
							items: ['a', 'b', 'c'],
						},
						maps: {
							default: 'map1',
							items: {
								map1: {
									style: 'color',
								},
							},
						},
						region: 'us-east-1',
						searchIndices: {
							default: 'a',
							items: ['a', 'b', 'c'],
						},
					},
				},
			});
		});
	});

	describe('data tests', () => {
		it('should configure data', () => {
			const amplifyOutputs: AmplifyOutputs = {
				version: '1',
				data: {
					aws_region: 'us-west-2',
					url: 'https://api.appsyncaws.com/graphql',
					authorization_types: ['API_KEY'],
					default_authorization_type: 'API_KEY',
					api_key: 'da-xxxx',
				},
			};

			const result = parseAmplifyOutputs(amplifyOutputs);
			expect(result).toEqual({
				API: {
					GraphQL: {
						endpoint: 'https://api.appsyncaws.com/graphql',
						region: 'us-west-2',
						apiKey: 'da-xxxx',
						defaultAuthMode: 'apiKey',
					},
				},
			});
		});

		describe('notifications tests', () => {
			it('should configure notifications', () => {
				const amplifyOutputs: AmplifyOutputs = {
					version: '1',
					notifications: {
						aws_region: 'us-west-2',
						amazon_pinpoint_app_id: 'appid123',
						channels: ['APNS', 'EMAIL', 'FCM', 'IN_APP_MESSAGING', 'SMS'],
					},
				};

				const result = parseAmplifyOutputs(amplifyOutputs);
				expect(result).toEqual({
					Notifications: {
						InAppMessaging: {
							Pinpoint: {
								appId: 'appid123',
								region: 'us-west-2',
							},
						},
						PushNotification: {
							Pinpoint: {
								appId: 'appid123',
								region: 'us-west-2',
							},
						},
					},
				});
			});
		});
	});
});
