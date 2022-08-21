import { parseMobileHubConfig } from '../src/Parser';

describe('Parser', () => {
	test('aws_mobile_analytics_app_id', () => {
		expect(
			parseMobileHubConfig({
				aws_cognito_identity_pool_id: 'a',
				aws_user_pools_id: 'b',
				aws_mobile_analytics_app_id: 'c',
				aws_mobile_analytics_app_region: '',
				aws_mandatory_sign_in: 'enable',
				aws_user_pools_web_client_id: '',
				aws_cognito_region: '',
				geo: {
					amazon_location_service: {
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
						region: 'us-west-2',
					},
				},
			})
		).toStrictEqual({
			Analytics: {
				AWSPinpoint: {
					appId: 'c',
					region: '',
				},
			},
			Auth: {
				endpoint: undefined,
				identityPoolId: 'a',
				identityPoolRegion: '',
				mandatorySignIn: true,
				region: '',
				userPoolId: 'b',
				userPoolWebClientId: '',
				signUpVerificationMethod: 'code',
			},
			Geo: {
				AmazonLocationService: {
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
					region: 'us-west-2',
				},
			},
			Storage: {
				aws_cognito_identity_pool_id: 'a',
				aws_cognito_region: '',
				aws_mandatory_sign_in: 'enable',
				aws_mobile_analytics_app_id: 'c',
				aws_mobile_analytics_app_region: '',
				aws_user_pools_id: 'b',
				aws_user_pools_web_client_id: '',
				geo: {
					amazon_location_service: {
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
						region: 'us-west-2',
					},
				},
			},
			Logging: {},
		});
	});
});
