import { parseAWSExports } from '../src/parseAWSExports';

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
				AmazonLocationService: amazonLocationService,
			},
			Storage: {
				S3: {
					bucket,
					region,
					dangerouslyConnectToHttpEndpointForTesting: undefined,
				},
			},
		});
	});
});
