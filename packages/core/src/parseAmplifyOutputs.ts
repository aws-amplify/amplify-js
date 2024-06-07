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
	ModelIntrospectionSchema,
} from './singleton/API/types';
import {
	CognitoUserPoolConfigMfaStatus,
	OAuthProvider,
} from './singleton/Auth/types';
import { NotificationsConfig } from './singleton/Notifications/types';
import {
	AmplifyOutputs,
	AmplifyOutputsAnalyticsProperties,
	AmplifyOutputsAuthProperties,
	AmplifyOutputsDataProperties,
	AmplifyOutputsGeoProperties,
	AmplifyOutputsNotificationsProperties,
	AmplifyOutputsStorageProperties,
} from './singleton/AmplifyOutputs/types';
import {
	AnalyticsConfig,
	AuthConfig,
	GeoConfig,
	LegacyConfig,
	ResourcesConfig,
	StorageConfig,
} from './singleton/types';

export function isAmplifyOutputs(
	config: ResourcesConfig | LegacyConfig | AmplifyOutputs,
): config is AmplifyOutputs {
	// version format initially will be '1' but is expected to be something like x.y where x is major and y minor version
	const { version } = config as AmplifyOutputs;

	if (!version) {
		return false;
	}

	return version.startsWith('1');
}

function parseStorage(
	amplifyOutputsStorageProperties?: AmplifyOutputsStorageProperties,
): StorageConfig | undefined {
	if (!amplifyOutputsStorageProperties) {
		return undefined;
	}

	const { bucket_name, aws_region } = amplifyOutputsStorageProperties;

	return {
		S3: {
			bucket: bucket_name,
			region: aws_region,
		},
	};
}

function parseAuth(
	amplifyOutputsAuthProperties?: AmplifyOutputsAuthProperties,
): AuthConfig | undefined {
	if (!amplifyOutputsAuthProperties) {
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
	} = amplifyOutputsAuthProperties;

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
			oauth: {
				domain: oauth.domain,
				redirectSignIn: oauth.redirect_sign_in_uri,
				redirectSignOut: oauth.redirect_sign_out_uri,
				responseType: oauth.response_type === 'token' ? 'token' : 'code',
				scopes: oauth.scopes,
				providers: getOAuthProviders(oauth.identity_providers),
			},
		};
	}

	if (username_attributes) {
		authConfig.Cognito.loginWith = {
			...authConfig.Cognito.loginWith,
			email: username_attributes.includes('email'),
			phone: username_attributes.includes('phone_number'),
			// Signing in with a username is not currently supported in Gen2, this should always evaluate to false
			username: username_attributes.includes('username'),
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
	amplifyOutputsAnalyticsProperties?: AmplifyOutputsAnalyticsProperties,
): AnalyticsConfig | undefined {
	if (!amplifyOutputsAnalyticsProperties?.amazon_pinpoint) {
		return undefined;
	}

	const { amazon_pinpoint } = amplifyOutputsAnalyticsProperties;

	return {
		Pinpoint: {
			appId: amazon_pinpoint.app_id,
			region: amazon_pinpoint.aws_region,
		},
	};
}

function parseGeo(
	amplifyOutputsAnalyticsProperties?: AmplifyOutputsGeoProperties,
): GeoConfig | undefined {
	if (!amplifyOutputsAnalyticsProperties) {
		return undefined;
	}

	const { aws_region, geofence_collections, maps, search_indices } =
		amplifyOutputsAnalyticsProperties;

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
	amplifyOutputsDataProperties?: AmplifyOutputsDataProperties,
): APIConfig | undefined {
	if (!amplifyOutputsDataProperties) {
		return undefined;
	}

	const {
		aws_region,
		default_authorization_type,
		url,
		api_key,
		model_introspection,
	} = amplifyOutputsDataProperties;

	const GraphQL: APIGraphQLConfig = {
		endpoint: url,
		defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
		region: aws_region,
		apiKey: api_key,
		modelIntrospection: model_introspection as ModelIntrospectionSchema,
	};

	return {
		GraphQL,
	};
}

function parseNotifications(
	amplifyOutputsNotificationsProperties?: AmplifyOutputsNotificationsProperties,
): NotificationsConfig | undefined {
	if (!amplifyOutputsNotificationsProperties) {
		return undefined;
	}

	const { aws_region, channels, amazon_pinpoint_app_id } =
		amplifyOutputsNotificationsProperties;

	const hasInAppMessaging = channels.includes('IN_APP_MESSAGING');
	const hasPushNotification =
		channels.includes('APNS') || channels.includes('FCM');

	if (!(hasInAppMessaging || hasPushNotification)) {
		return undefined;
	}

	// At this point, we know the Amplify outputs contains at least one supported channel
	const notificationsConfig: NotificationsConfig = {} as NotificationsConfig;

	if (hasInAppMessaging) {
		notificationsConfig.InAppMessaging = {
			Pinpoint: {
				appId: amazon_pinpoint_app_id,
				region: aws_region,
			},
		};
	}

	if (hasPushNotification) {
		notificationsConfig.PushNotification = {
			Pinpoint: {
				appId: amazon_pinpoint_app_id,
				region: aws_region,
			},
		};
	}

	return notificationsConfig;
}

export function parseAmplifyOutputs(
	amplifyOutputs: AmplifyOutputs,
): ResourcesConfig {
	const resourcesConfig: ResourcesConfig = {};

	if (amplifyOutputs.storage) {
		resourcesConfig.Storage = parseStorage(amplifyOutputs.storage);
	}

	if (amplifyOutputs.auth) {
		resourcesConfig.Auth = parseAuth(amplifyOutputs.auth);
	}

	if (amplifyOutputs.analytics) {
		resourcesConfig.Analytics = parseAnalytics(amplifyOutputs.analytics);
	}

	if (amplifyOutputs.geo) {
		resourcesConfig.Geo = parseGeo(amplifyOutputs.geo);
	}

	if (amplifyOutputs.data) {
		resourcesConfig.API = parseData(amplifyOutputs.data);
	}

	if (amplifyOutputs.notifications) {
		resourcesConfig.Notifications = parseNotifications(
			amplifyOutputs.notifications,
		);
	}

	return resourcesConfig;
}

const authModeNames: Record<string, GraphQLAuthMode> = {
	AMAZON_COGNITO_USER_POOLS: 'userPool',
	API_KEY: 'apiKey',
	AWS_IAM: 'iam',
	AWS_LAMBDA: 'lambda',
	OPENID_CONNECT: 'oidc',
};

function getGraphQLAuthMode(authType: string): GraphQLAuthMode {
	return authModeNames[authType];
}

const providerNames: Record<string, OAuthProvider> = {
	GOOGLE: 'Google',
	LOGIN_WITH_AMAZON: 'Amazon',
	FACEBOOK: 'Facebook',
	SIGN_IN_WITH_APPLE: 'Apple',
};

function getOAuthProviders(providers: string[] = []): OAuthProvider[] {
	return providers.reduce<OAuthProvider[]>((oAuthProviders, provider) => {
		if (providerNames[provider] !== undefined) {
			oAuthProviders.push(providerNames[provider]);
		}

		return oAuthProviders;
	}, []);
}

function getMfaStatus(
	mfaConfiguration: string,
): CognitoUserPoolConfigMfaStatus {
	if (mfaConfiguration === 'OPTIONAL') return 'optional';
	if (mfaConfiguration === 'REQUIRED') return 'on';

	return 'off';
}
