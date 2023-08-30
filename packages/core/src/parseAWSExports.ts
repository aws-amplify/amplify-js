// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { OAuthConfig } from './singleton/Auth/types';
import { ResourcesConfig } from './singleton/types';

/**
 * This utility converts the `aws-exports.js` file generated by the Amplify CLI into a {@link ResourcesConfig} object
 * consumable by Amplify.
 *
 * @param config A configuration object from `aws-exports.js`.
 *
 * @returns A `ResourcesConfig` object.
 */
export const parseAWSExports = (
	config: Record<string, any> = {}
): ResourcesConfig => {
	const {
		aws_cognito_identity_pool_id,
		aws_cognito_sign_up_verification_method,
		aws_mandatory_sign_in,
		aws_mobile_analytics_app_id,
		aws_mobile_analytics_app_region,
		aws_user_files_s3_bucket,
		aws_user_files_s3_bucket_region,
		aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing,
		aws_user_pools_id,
		aws_user_pools_web_client_id,
		geo,
		oauth,
	} = config;
	const amplifyConfig: ResourcesConfig = {};

	// Analytics
	if (aws_mobile_analytics_app_id) {
		amplifyConfig.Analytics = {
			Pinpoint: {
				appId: aws_mobile_analytics_app_id,
				region: aws_mobile_analytics_app_region,
			},
		};
	}

	// Auth
	if (aws_cognito_identity_pool_id || aws_user_pools_id) {
		amplifyConfig.Auth = {
			Cognito: {
				identityPoolId: aws_cognito_identity_pool_id,
				allowGuestAccess: aws_mandatory_sign_in !== 'enable',
				signUpVerificationMethod: aws_cognito_sign_up_verification_method,
				userPoolClientId: aws_user_pools_web_client_id,
				userPoolId: aws_user_pools_id,
				...(oauth && { loginWith: getOAuthConfig(oauth) }),
			},
		};
	}

	// Storage
	if (aws_user_files_s3_bucket) {
		amplifyConfig.Storage = {
			S3: {
				bucket: aws_user_files_s3_bucket,
				region: aws_user_files_s3_bucket_region,
				dangerouslyConnectToHttpEndpointForTesting:
					aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing,
			},
		};
	}

	// Geo
	if (geo) {
		const { amazon_location_service } = geo;
		if (amazon_location_service) {
			(amplifyConfig as any).Geo = {
				AmazonLocationService: amazon_location_service,
			};
		} else {
			(amplifyConfig as any).Geo = { ...geo };
		}
	}

	return amplifyConfig;
};

const getRedirectUrl = (redirectStr: string): string[] =>
	redirectStr.split(',');

const getOAuthConfig = ({
	domain,
	scope,
	redirectSignIn,
	redirectSignOut,
	responseType,
}: Record<string, any>): { oauth: OAuthConfig } => ({
	oauth: {
		domain,
		scopes: scope,
		redirectSignIn: getRedirectUrl(redirectSignIn),
		redirectSignOut: getRedirectUrl(redirectSignOut),
		responseType,
	},
});
