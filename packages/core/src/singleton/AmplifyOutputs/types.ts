// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ModelIntrospectionSchema } from '../API/types';
import { AuthStandardAttributeKey } from '../Auth/types';

export type AmplifyOutputsOAuthIdentityProvider =
	| 'GOOGLE'
	| 'FACEBOOK'
	| 'LOGIN_WITH_AMAZON'
	| 'SIGN_IN_WITH_APPLE';

type AmplifyOutputsAuthUsernameAttribute =
	| 'EMAIL'
	| 'PHONE_NUMBER'
	| 'USERNAME';

type AmplifyOutputsAuthUserVerificationMethod = 'EMAIL' | 'PHONE_NUMBER';

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
		identity_providers: AmplifyOutputsOAuthIdentityProvider[];
		domain: string;
		scopes: string[];
		redirect_sign_in_uri: string[];
		redirect_sign_out_uri: string[];
		response_type: 'code' | 'token';
	};
	standard_required_attributes?: AuthStandardAttributeKey[];
	username_attributes?: AmplifyOutputsAuthUsernameAttribute[];
	user_verification_mechanisms?: AmplifyOutputsAuthUserVerificationMethod[];
	unauthenticated_identities_enabled?: boolean;
	mfa_configuration?: AmplifyOutputsAuthMFAConfiguration;
	mfa_methods?: AmplifyOutputsAuthMFAMethod[];
}

export interface AmplifyOutputsStorageProperties {
	aws_region: string;
	bucket_name: string;
}

export interface AmplifyOutputsGeoProperties {
	aws_region: string;
	maps?: {
		items: Record<string, { name: string; style: string }>;
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
	default_authorization_type: AuthType;
	authorization_types: AuthType[];
	model_introspection?: ModelIntrospectionSchema;
	api_key?: string;
	conflict_resolution_mode?: 'AUTO_MERGE' | 'OPTIMISTIC_CONCURRENCY' | 'LAMBDA';
}

type AmplifyOutputsNotificationChannel =
	| 'IN_APP_MESSAGING'
	| 'FCM'
	| 'APNS'
	| 'EMAIL'
	| 'SMS';

export interface AmplifyOutputsNotificationsProperties {
	aws_region: string;
	pinpoint_app_id: string;
	channels: AmplifyOutputsNotificationChannel[];
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
