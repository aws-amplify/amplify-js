// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* This is because JSON schema contains keys with snake_case */
/* eslint-disable camelcase */

/* Does not like exahaustive checks */
/* eslint-disable no-case-declarations */

import {
	APIConfig,
	APIGraphQLConfig,
	GraphQLAuthMode,
} from './singleton/API/types';
import {
	CognitoUserPoolConfigMfaStatus,
	OAuthProvider,
} from './singleton/Auth/types';
import { InAppMessagingConfig } from './singleton/Notifications/InAppMessaging/types';
import { PushNotificationConfig } from './singleton/Notifications/PushNotification/types';
import { NotificationsConfig } from './singleton/Notifications/types';
import {
	AuthType,
	Gen2AnalyticsProperties,
	Gen2AuthMFAConfiguration,
	Gen2AuthProperties,
	Gen2Config,
	Gen2DataProperties,
	Gen2GeoProperties,
	Gen2NotificationsProperties,
	Gen2OAuthIdentityProvider,
	Gen2StorageProperties,
} from './singleton/gen2/types';
import {
	AnalyticsConfig,
	AuthConfig,
	GeoConfig,
	LegacyConfig,
	ResourcesConfig,
	StorageConfig,
} from './singleton/types';

export function isGen2Config(
	config: ResourcesConfig | LegacyConfig | Gen2Config,
): config is Gen2Config {
	// version format initially will be '1' but is expected to be something like x.y where x is major and y minor version
	return ('' + (config as Gen2Config).version).startsWith('1');
}

function parseStorage(
	gen2StorageProperties?: Gen2StorageProperties,
): StorageConfig | undefined {
	if (!gen2StorageProperties) {
		return undefined;
	}

	const { bucket_name, aws_region } = gen2StorageProperties;

	return {
		S3: {
			bucket: bucket_name,
			region: aws_region,
		},
	};
}

function parseAuth(
	gen2AuthProperties?: Gen2AuthProperties,
): AuthConfig | undefined {
	if (!gen2AuthProperties) {
		return undefined;
	}

	const {
		user_pool_id,
		user_pool_client_id,
		identity_pool_id,
		password_policy,
		mfa_configuration,
		mfa_methods,
		unauthenticated_identities_enabled,
		oauth,
		username_attributes,
		standard_required_attributes,
	} = gen2AuthProperties;

	const authConfig = {
		Cognito: {
			userPoolId: user_pool_id,
			userPoolClientId: user_pool_client_id,
		},
	} as AuthConfig;

	if (identity_pool_id) {
		authConfig.Cognito = {
			...authConfig.Cognito,
			identityPoolId: identity_pool_id,
		};
	}

	if (password_policy) {
		authConfig.Cognito.passwordFormat = {
			requireLowercase: password_policy.require_lowercase,
			requireNumbers: password_policy.require_numbers,
			requireUppercase: password_policy.require_uppercase,
			requireSpecialCharacters: password_policy.require_symbols,
			minLength: password_policy.min_length ?? 6,
		};
	}

	if (mfa_configuration) {
		authConfig.Cognito.mfa = {
			status: getMfaStatus(mfa_configuration),
			smsEnabled: mfa_methods?.includes('SMS'),
			totpEnabled: mfa_methods?.includes('TOTP'),
		};
	}

	if (unauthenticated_identities_enabled) {
		authConfig.Cognito.allowGuestAccess = unauthenticated_identities_enabled;
	}

	if (oauth) {
		authConfig.Cognito.loginWith = {
			...authConfig.Cognito.loginWith,
			oauth: {
				domain: oauth.domain,
				redirectSignIn: oauth.redirect_sign_in_uri,
				redirectSignOut: oauth.redirect_sign_out_uri,
				responseType: oauth.response_type,
				scopes: oauth.scopes,
				providers: getOAuthProviders(oauth.identity_providers),
			},
		};
	}

	if (username_attributes?.includes('EMAIL')) {
		authConfig.Cognito.loginWith = {
			...authConfig.Cognito.loginWith,
			email: true,
		};
	}

	if (username_attributes?.includes('PHONE_NUMBER')) {
		authConfig.Cognito.loginWith = {
			...authConfig.Cognito.loginWith,
			phone: true,
		};
	}

	if (username_attributes?.includes('USERNAME')) {
		authConfig.Cognito.loginWith = {
			...authConfig.Cognito.loginWith,
			username: true,
		};
	}

	if (standard_required_attributes) {
		authConfig.Cognito.userAttributes = standard_required_attributes.reduce(
			(acc, curr) => ({ ...acc, [curr]: { required: true } }),
			{},
		);
	}

	return authConfig;
}

export function parseAnalytics(
	gen2AnalyticsProperties?: Gen2AnalyticsProperties,
): AnalyticsConfig | undefined {
	if (!gen2AnalyticsProperties?.amazon_pinpoint) {
		return undefined;
	}

	const { amazon_pinpoint } = gen2AnalyticsProperties;

	if (amazon_pinpoint) {
		return {
			Pinpoint: {
				appId: amazon_pinpoint.app_id,
				region: amazon_pinpoint.aws_region,
			},
		};
	}
}

function parseGeo(
	gen2AnalyticsProperties?: Gen2GeoProperties,
): GeoConfig | undefined {
	if (!gen2AnalyticsProperties) {
		return undefined;
	}

	const { aws_region, geofence_collections, maps, search_indices } =
		gen2AnalyticsProperties;

	return {
		LocationService: {
			region: aws_region,
			searchIndices: search_indices,
			geofenceCollections: geofence_collections,
			maps,
		},
	};
}

function parseData(
	gen2DataProperties?: Gen2DataProperties,
): APIConfig | undefined {
	if (!gen2DataProperties) {
		return undefined;
	}

	const {
		aws_region,
		default_authorization_type,
		url,
		api_key,
		model_introspection,
	} = gen2DataProperties;

	const GraphQL: APIGraphQLConfig = {
		endpoint: url,
		defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
		region: aws_region,
		apiKey: api_key,
		modelIntrospection: model_introspection,
	};

	return {
		GraphQL,
	};
}

function parseNotifications(
	gen2NotificationsProperties?: Gen2NotificationsProperties,
): NotificationsConfig | undefined {
	if (!gen2NotificationsProperties) {
		return undefined;
	}

	const { aws_region, channels, pinpoint_app_id } = gen2NotificationsProperties;

	if (
		!channels.includes('IN_APP_MESSAGING') &&
		!channels.includes('APNS') &&
		!channels.includes('FCM')
	) {
		return undefined;
	}

	let InAppMessaging: InAppMessagingConfig | undefined;
	let PushNotification: PushNotificationConfig | undefined;

	if (channels.includes('IN_APP_MESSAGING')) {
		InAppMessaging = {
			Pinpoint: {
				appId: pinpoint_app_id,
				region: aws_region,
			},
		};
	}

	if (channels.includes('APNS') || channels.includes('FCM')) {
		PushNotification = {
			Pinpoint: {
				appId: pinpoint_app_id,
				region: aws_region,
			},
		};
	}

	if (PushNotification && InAppMessaging) {
		return {
			PushNotification,
			InAppMessaging,
		};
	}

	if (InAppMessaging) {
		return {
			InAppMessaging,
		};
	}

	if (PushNotification) {
		return {
			PushNotification,
		};
	}
}

export function parseGen2Config(gen2Config: Gen2Config): ResourcesConfig {
	const resourcesConfig: ResourcesConfig = {};

	if (gen2Config.storage) {
		resourcesConfig.Storage = parseStorage(gen2Config.storage);
	}

	if (gen2Config.auth) {
		resourcesConfig.Auth = parseAuth(gen2Config.auth);
	}

	if (gen2Config.analytics) {
		resourcesConfig.Analytics = parseAnalytics(gen2Config.analytics);
	}

	if (gen2Config.geo) {
		resourcesConfig.Geo = parseGeo(gen2Config.geo);
	}

	if (gen2Config.data) {
		resourcesConfig.API = parseData(gen2Config.data);
	}

	if (gen2Config.notifications) {
		resourcesConfig.Notifications = parseNotifications(
			gen2Config.notifications,
		);
	}

	return resourcesConfig;
}

const authModeNames: Record<AuthType, GraphQLAuthMode> = {
	AMAZON_COGNITO_USER_POOLS: 'userPool',
	API_KEY: 'apiKey',
	AWS_IAM: 'iam',
	AWS_LAMBDA: 'lambda',
	OPENID_CONNECT: 'oidc',
};

function getGraphQLAuthMode(authType: AuthType): GraphQLAuthMode {
	return authModeNames[authType];
}

const providerNames: Record<Gen2OAuthIdentityProvider, OAuthProvider> = {
	GOOGLE: 'Google',
	LOGIN_WITH_AMAZON: 'Amazon',
	FACEBOOK: 'Facebook',
	SIGN_IN_WITH_APPLE: 'Apple',
};

function getOAuthProviders(
	providers?: Gen2OAuthIdentityProvider[],
): OAuthProvider[] {
	return (providers ?? []).map(provider => providerNames[provider]);
}

function getMfaStatus(
	mfaConfiguration: Gen2AuthMFAConfiguration,
): CognitoUserPoolConfigMfaStatus {
	if (mfaConfiguration === 'OPTIONAL') return 'optional';
	if (mfaConfiguration === 'REQUIRED') return 'on';

	return 'off';
}
