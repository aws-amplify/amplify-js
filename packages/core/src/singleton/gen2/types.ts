import { ModelIntrospectionSchema } from '../API/types';

export interface Gen2AuthProperties {
	aws_region?: string;
	user_pool_id: string;
	user_pool_client_id: string;
	identity_pool_id?: string;
	oauth_domain?: string;
	oauth_redirect_sign_in?: string[];
	oauth_redirect_sign_out?: string[];
	oauth_response_type?: 'code' | 'token';
	oauth_scopes?: string[];
	password_policy?: {
		require_lowercase: boolean;
		require_uppercase: boolean;
		require_symbols: boolean;
		require_numbers: boolean;
		min_length: number;
	};
	identity_providers?: string[];
	standard_attributes?: {
		email?: {
			required: boolean;
		};
		phone_number?: {
			required: boolean;
		};
		address?: {
			required: boolean;
		};
		birthdate?: {
			required: boolean;
		};
		family_name?: {
			required: boolean;
		};
		gender?: {
			required: boolean;
		};
		given_name?: {
			required: boolean;
		};
		locale?: {
			required: boolean;
		};
		middle_name?: {
			required: boolean;
		};
		name?: {
			required: boolean;
		};
		nickname?: {
			required: boolean;
		};
		picture?: {
			required: boolean;
		};
		preferred_username?: {
			required: boolean;
		};
		profile?: {
			required: boolean;
		};
		sub?: {
			required: boolean;
		};
		updated_at?: {
			required: boolean;
		};
		website?: {
			required: boolean;
		};
		zoneinfo?: {
			required: boolean;
		};
	};
	username_attributes?: string[];
	user_verification_mechanisms?: string[];
	unauthenticated_identities_enabled?: boolean;
	mfa_configuration?: 'OPTIONAL' | 'REQUIRED' | 'NONE';
	mfa_methods?: string[];
}

export interface Gen2StorageProperties {
	aws_region: string;
	name: string;
}

export interface Gen2GeoProperties {
	aws_region: string;
	maps?: { items: { name: string; style: string }[]; default: string };
	search_indices?: { items: string[]; default: string };
	geofence_collections?: { items: string[]; default: string };
}

export interface Gen2AnalyticsProperties {
	amazon_pinpoint?: {
		aws_region: string;
		app_id: string;
	};
	amazon_kinesis?: {
		aws_region: string;
		buffer_size?: number;
		flush_size?: number;
		flush_interval?: number;
		resend_limit?: number;
	};
	amazon_kinesis_firehose?: {
		aws_region: string;
		buffer_size?: number;
		flush_size?: number;
		flush_interval?: number;
		resend_limit?: number;
	};
}

export type AuthType =
	| 'AMAZON_COGNITO_USER_POOLS'
	| 'API_KEY'
	| 'AWS_IAM'
	| 'AWS_LAMBDA'
	| 'OPENID_CONNECT';

export interface Gen2ApiProperties {
	endpoints: {
		name: string;
		url: string;
		aws_region: string;
		authorization_types: AuthType[];
		default_authorization_type: AuthType;
	}[];
}

export interface Gen2DataProperties {
	aws_region: string;
	url: string;
	default_authorization_type: AuthType;
	authorization_types: AuthType[];
	model_introspection?: ModelIntrospectionSchema;
	api_key?: string;
	conflict_resolution_mode?: 'AUTO_MERGE' | 'OPTIMISTIC_CONCURRENCY' | 'LAMBDA';
}

export type NotificationChannels =
	| 'in_app_messaging'
	| 'fcm'
	| 'apns'
	| 'email'
	| 'sms';
export interface Gen2NotificationsProperties {
	aws_region: string;
	pinpoint_app_id: string;
	channels: {
		in_app_messaging?: {
			default: boolean;
		};
		fcm?: {
			default: boolean;
		};
		apns?: {
			default: boolean;
		};
		email?: {
			default: boolean;
		};
		sms?: {
			default: boolean;
		};
	};
}
