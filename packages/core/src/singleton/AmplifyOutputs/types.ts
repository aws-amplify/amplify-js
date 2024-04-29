// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type AmplifyOutputsOAuthIdentityProvider =
	| 'GOOGLE'
	| 'FACEBOOK'
	| 'LOGIN_WITH_AMAZON'
	| 'SIGN_IN_WITH_APPLE';

export type AmplifyOutputsAuthMFAConfiguration =
	| 'OPTIONAL'
	| 'REQUIRED'
	| 'NONE';

export type AmplifyOutputsAuthMFAMethod = 'SMS' | 'TOTP';

export interface AmplifyOutputsAuthProperties {
	aws_region: string;
	authentication_flow_type?: 'USER_SRP_AUTH' | 'CUSTOM_AUTH';
	user_pool_id: string;
	user_pool_client_id: string;
	identity_pool_id?: string;
	password_policy?: {
		min_length: number;
		require_numbers: boolean;
		require_lowercase: boolean;
		require_uppercase: boolean;
		require_symbols: boolean;
	};
	oauth?: {
		identity_providers: string[];
		domain: string;
		scopes: string[];
		redirect_sign_in_uri: string[];
		redirect_sign_out_uri: string[];
		response_type: string;
	};
	standard_required_attributes?: string[];
	username_attributes?: string[];
	user_verification_types?: string[];
	unauthenticated_identities_enabled?: boolean;
	mfa_configuration?: string;
	mfa_methods?: string[];
}

export interface AmplifyOutputsStorageProperties {
	aws_region: string;
	bucket_name: string;
}

export interface AmplifyOutputsGeoProperties {
	aws_region: string;
	maps?: {
		items: Record<string, unknown>;
		default: string;
	};
	search_indices?: { items: string[]; default: string };
	geofence_collections?: { items: string[]; default: string };
}

export interface AmplifyOutputsAnalyticsProperties {
	amazon_pinpoint?: {
		aws_region: string;
		app_id: string;
	};
}

export type AuthType =
	| 'AMAZON_COGNITO_USER_POOLS'
	| 'API_KEY'
	| 'AWS_IAM'
	| 'AWS_LAMBDA'
	| 'OPENID_CONNECT';

export interface AmplifyOutputsDataProperties {
	aws_region: string;
	url: string;
	default_authorization_type: string;
	authorization_types: string[];
	model_introspection?: object;
	api_key?: string;
	conflict_resolution_mode?: string;
}

export interface AmplifyOutputsNotificationsProperties {
	aws_region: string;
	amazon_pinpoint_app_id: string;
	channels: string[];
}

export interface AmplifyOutputs {
	version?: string;
	storage?: AmplifyOutputsStorageProperties;
	auth?: AmplifyOutputsAuthProperties;
	analytics?: AmplifyOutputsAnalyticsProperties;
	geo?: AmplifyOutputsGeoProperties;
	data?: AmplifyOutputsDataProperties;
	notifications?: AmplifyOutputsNotificationsProperties;
}
