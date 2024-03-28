// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ModelIntrospectionSchema } from '../API/types';
import { AuthStandardAttributeKey } from '../Auth/types';

export type Gen2OAuthIdentityProvider =
	| 'GOOGLE'
	| 'FACEBOOK'
	| 'LOGIN_WITH_AMAZON'
	| 'SIGN_IN_WITH_APPLE';

type Gen2AuthUsernameAttribute = 'EMAIL' | 'PHONE_NUMBER' | 'USERNAME';

type Gen2AuthUserVerificationMethod = 'EMAIL' | 'PHONE_NUMBER';

export type Gen2AuthMFAConfiguration = 'OPTIONAL' | 'REQUIRED' | 'NONE';

export type Gen2AuthMFAMethod = 'SMS' | 'TOTP';

export interface Gen2AuthProperties {
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
		identity_providers: Gen2OAuthIdentityProvider[];
		domain: string;
		scopes: string[];
		redirect_sign_in_uri: string[];
		redirect_sign_out_uri: string[];
		response_type: 'code' | 'token';
	};
	standard_required_attributes?: AuthStandardAttributeKey[];
	username_attributes?: Gen2AuthUsernameAttribute[];
	user_verification_mechanisms?: Gen2AuthUserVerificationMethod[];
	unauthenticated_identities_enabled?: boolean;
	mfa_configuration?: Gen2AuthMFAConfiguration;
	mfa_methods?: Gen2AuthMFAMethod[];
}

export interface Gen2StorageProperties {
	aws_region: string;
	bucket_name: string;
}

export interface Gen2GeoProperties {
	aws_region: string;
	maps?: {
		items: Record<string, { name: string; style: string }>;
		default: string;
	};
	search_indices?: { items: string[]; default: string };
	geofence_collections?: { items: string[]; default: string };
}

export interface Gen2AnalyticsProperties {
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

export interface Gen2DataProperties {
	aws_region: string;
	url: string;
	default_authorization_type: AuthType;
	authorization_types: AuthType[];
	model_introspection?: ModelIntrospectionSchema;
	api_key?: string;
	conflict_resolution_mode?: 'AUTO_MERGE' | 'OPTIMISTIC_CONCURRENCY' | 'LAMBDA';
}

type Gen2NotificationChannel =
	| 'IN_APP_MESSAGING'
	| 'FCM'
	| 'APNS'
	| 'EMAIL'
	| 'SMS';

export interface Gen2NotificationsProperties {
	aws_region: string;
	pinpoint_app_id: string;
	channels: Gen2NotificationChannel[];
}

export interface Gen2Config {
	version?: string;
	storage?: Gen2StorageProperties;
	auth?: Gen2AuthProperties;
	analytics?: Gen2AnalyticsProperties;
	geo?: Gen2GeoProperties;
	data?: Gen2DataProperties;
	notifications?: Gen2NotificationsProperties;
}
