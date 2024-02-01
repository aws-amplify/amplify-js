import { parseAWSExports } from '../src/parseAWSExports';
import { ResourcesConfig } from '../src/singleton/types';

// TODO: Add API category tests
describe('parseAWSExports', () => {
	const appId = 'app-id';
	const bucket = 'bucket';
	const identityPoolId = 'identity-pool-id';
	const userPoolId = 'user-pool-id';
	const userPoolClientId = 'user-pool-client-id';
	const signUpVerificationMethod = 'link';
	const region = 'region';
	const amazonLocationService = {
		maps: {
			items: {
				geoJsExampleMap1: {
					style: 'VectorEsriStreets',
				},
				geoJsExampleMap2: {
					style: 'VectorEsriTopographic',
				},
			},
			default: 'geoJsExampleMap1',
		},
		search_indices: {
			items: ['geoJSSearchExample'],
			default: 'geoJSSearchExample',
		},
		region,
	};
	const amazonLocationServiceV4 = {
		maps: {
			items: {
				geoJsExampleMap1: {
					style: 'VectorEsriStreets',
				},
				geoJsExampleMap2: {
					style: 'VectorEsriTopographic',
				},
			},
			default: 'geoJsExampleMap1',
		},
		search_indices: {
			items: ['geoJSSearchExample'],
			default: 'geoJSSearchExample',
		},
		searchIndices: {
			items: ['geoJSSearchExample'],
			default: 'geoJSSearchExample',
		},
		region,
	};
	const restEndpoint1 = {
		name: 'api1',
		endpoint: 'https://api1.com',
		region: 'us-east-1',
	};
	const restEndpoint2 = {
		name: 'api2',
		endpoint: 'https://api2.com',
		region: 'us-west-2',
		service: 'lambda',
	};
	const appsyncEndpoint = 'https://123.appsync-api.com';
	const apiKey = 'api-key';
	const oAuthDomain = 'test.auth.us-west-2.amazoncognito.com';
	const oAuthScopes = [
		'phone',
		'email',
		'openid',
		'profile',
		'aws.cognito.signin.user.admin',
	];
	const oAuthSignoutUrl = 'test://';
	const oAuthSigninUrl = 'test://';
	const oAuthResponseType = 'code';

	it('should parse valid aws-exports.js', () => {
		const expected: ResourcesConfig = {
			Analytics: { Pinpoint: { appId, region } },
			Auth: {
				Cognito: {
					identityPoolId,
					allowGuestAccess: false,
					loginWith: {
						email: false,
						oauth: {
							domain: oAuthDomain,
							providers: ['Google', 'Apple', 'Facebook', 'Amazon'],
							redirectSignIn: [oAuthSigninUrl],
							redirectSignOut: [oAuthSignoutUrl],
							responseType: oAuthResponseType,
							scopes: oAuthScopes,
						},
						phone: true,
						username: false,
					},
					mfa: { smsEnabled: true, status: 'off', totpEnabled: true },
					passwordFormat: {
						minLength: 8,
						requireLowercase: false,
						requireNumbers: true,
						requireSpecialCharacters: true,
						requireUppercase: true,
					},
					signUpVerificationMethod,
					userAttributes: {
						email: { required: true },
						phone_number: { required: true },
					},
					userPoolId,
					userPoolClientId,
				},
			},
			Geo: {
				LocationService: amazonLocationServiceV4,
			},
			Storage: {
				S3: {
					bucket,
					region,
					dangerouslyConnectToHttpEndpointForTesting: undefined,
				},
			},
			API: {
				REST: {
					api1: { endpoint: 'https://api1.com', region: 'us-east-1' },
					api2: {
						endpoint: 'https://api2.com',
						region: 'us-west-2',
						service: 'lambda',
					},
				},
				GraphQL: {
					endpoint: appsyncEndpoint,
					apiKey,
					region,
					defaultAuthMode: 'userPool',
				},
			},
			Notifications: {
				InAppMessaging: { Pinpoint: { appId, region } },
			},
		};
		expect(
			parseAWSExports({
				aws_project_region: 'us-west-2',
				aws_cognito_identity_pool_id: identityPoolId,
				aws_cognito_sign_up_verification_method: signUpVerificationMethod,
				aws_cognito_username_attributes: ['PHONE_NUMBER'],
				aws_cognito_signup_attributes: ['PHONE_NUMBER'],
				aws_cognito_mfa_configuration: 'OFF',
				aws_cognito_mfa_types: ['SMS', 'TOTP'],
				aws_cognito_password_protection_settings: {
					passwordPolicyMinLength: 8,
					passwordPolicyCharacters: [
						'REQUIRES_SYMBOLS',
						'REQUIRES_UPPERCASE',
						'REQUIRES_NUMBERS',
					],
				},
				oauth: {
					domain: oAuthDomain,
					scope: oAuthScopes,
					redirectSignIn: oAuthSigninUrl,
					redirectSignOut: oAuthSignoutUrl,
					responseType: oAuthResponseType,
				},
				aws_cognito_verification_mechanisms: ['EMAIL'],
				aws_cognito_social_providers: ['GOOGLE', 'APPLE', 'FACEBOOK', 'AMAZON'],
				aws_mandatory_sign_in: 'enable',
				aws_mobile_analytics_app_id: appId,
				aws_mobile_analytics_app_region: region,
				aws_user_files_s3_bucket: bucket,
				aws_user_files_s3_bucket_region: region,
				aws_user_pools_id: userPoolId,
				aws_user_pools_web_client_id: userPoolClientId,
				geo: { amazon_location_service: amazonLocationService },
				aws_cloud_logic_custom: [restEndpoint1, restEndpoint2],
				aws_appsync_graphqlEndpoint: appsyncEndpoint,
				aws_appsync_apiKey: apiKey,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
				Notifications: {
					InAppMessaging: { AWSPinpoint: { appId, region } },
				},
			})
		).toStrictEqual(expected);
	});

	it('should fallback to IAM auth mode if Appsync auth type is invalid', () => {
		expect(
			parseAWSExports({
				aws_project_region: 'us-west-2',
				aws_appsync_graphqlEndpoint: appsyncEndpoint,
				aws_appsync_apiKey: apiKey,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'INVALID_AUTH_TYPE',
			})
		).toStrictEqual({
			API: {
				GraphQL: {
					endpoint: appsyncEndpoint,
					apiKey,
					region,
					defaultAuthMode: 'iam',
				},
			},
		});
	});

	it('should handle missing `redirectSignIn` or `redirectSignOut` configuration', () => {
		expect(
			parseAWSExports({
				aws_project_region: 'us-west-2',
				aws_user_pools_id: userPoolId,
				oauth: {
					domain: oAuthDomain,
					scope: oAuthScopes,
					responseType: oAuthResponseType,
				},
			})
		).toStrictEqual({
			Auth: {
				Cognito: {
					allowGuestAccess: true,
					identityPoolId: undefined,
					loginWith: {
						email: false,
						oauth: {
							domain: oAuthDomain,
							redirectSignIn: [],
							redirectSignOut: [],
							responseType: oAuthResponseType,
							scopes: oAuthScopes,
						},
						phone: false,
						username: true,
					},
					mfa: undefined,
					passwordFormat: undefined,
					signUpVerificationMethod: undefined,
					userAttributes: {},
					userPoolClientId: undefined,
					userPoolId: userPoolId,
				},
			},
		});
	});

	it('should throw an error when passing a `ResourceConfig` object as the config parameter', () => {
		const testConfig: ResourcesConfig = {
			Auth: {
				Cognito: {
					userPoolClientId: 'userPoolClientId',
					userPoolId: 'userPoolId',
				},
			},
		};

		expect(() => parseAWSExports(testConfig)).toThrow(
			'Invalid config parameter.'
		);
	});
	it('should append Notification configs when both Push and InApp configs are available', () => {
		const testConfig = {
			aws_project_region: 'us-west-2',
			aws_user_pools_id: userPoolId,
			Notifications: {
				Push: {
					AWSPinpoint: {
						appId: "appId",
						region: "region"
					}
				},
				InAppMessaging: {
					AWSPinpoint: {
						appId: "appId",
						region: "region"
					}
				}
			}
		};

		expect(parseAWSExports(testConfig)).toMatchObject(
			{
				Notifications: {
					PushNotification: {
						Pinpoint: {
							appId: "appId",
							region: "region"
						}
					},
					InAppMessaging: {
						Pinpoint: {
							appId: "appId",
							region: "region"
						}
					}
				}	
			}
		);
	});
});
