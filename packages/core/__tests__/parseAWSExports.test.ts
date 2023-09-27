import { parseAWSExports } from '../src/parseAWSExports';

// TODO: Add API category tests
describe('Parser', () => {
	test('aws_mobile_analytics_app_id', () => {
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
		};
		expect(
			parseAWSExports({
				aws_cognito_identity_pool_id: identityPoolId,
				aws_cognito_sign_up_verification_method: signUpVerificationMethod,
				aws_mandatory_sign_in: 'enable',
				aws_mobile_analytics_app_id: appId,
				aws_mobile_analytics_app_region: region,
				aws_user_files_s3_bucket: bucket,
				aws_user_files_s3_bucket_region: region,
				aws_user_pools_id: userPoolId,
				aws_user_pools_web_client_id: userPoolClientId,
				geo: {
					amazon_location_service: amazonLocationService,
				},
				aws_cloud_logic_custom: [restEndpoint1, restEndpoint2],
			})
		).toStrictEqual({
			Analytics: {
				Pinpoint: {
					appId,
					region,
				},
			},
			Auth: {
				Cognito: {
					identityPoolId,
					allowGuestAccess: false,
					signUpVerificationMethod,
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
					api1: {
						endpoint: 'https://api1.com',
						defaultAuthMode: {
							type: 'iam',
							region: 'us-east-1',
						},
					},
					api2: {
						endpoint: 'https://api2.com',
						defaultAuthMode: {
							type: 'iam',
							region: 'us-west-2',
						},
					},
				},
			},
		});
	});
});
