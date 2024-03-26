import { APIGraphQLConfig, GraphQLAuthMode } from './singleton/API/types';
import {
	CognitoUserPoolConfigMfaStatus,
	OAuthProvider,
} from './singleton/Auth/types';
import {
	AuthType,
	Gen2AuthMFAConfiguration,
	Gen2AuthProperties,
	Gen2OAuthIdentityProviders,
} from './singleton/gen2/types';
import { Gen2Config, LegacyConfig, ResourcesConfig } from './singleton/types';

export function isGen2Config(
	config: ResourcesConfig | LegacyConfig | Gen2Config,
): config is Gen2Config {
	return (config as Gen2Config).version === '1';
}

export function parseGen2Config(gen2Config: Gen2Config): ResourcesConfig {
	const config: ResourcesConfig = {};

	if (gen2Config?.storage) {
		const storageProperties = gen2Config.storage;
		config.Storage = {
			S3: {
				bucket: storageProperties.bucket_name,
				region: storageProperties.aws_region,
			},
		};
	}

	if (gen2Config?.auth) {
		const authProperties = gen2Config.auth;

		if (authProperties.identity_pool_id) {
			config.Auth = {
				Cognito: {
					userPoolId: authProperties.user_pool_id,
					userPoolClientId: authProperties.user_pool_client_id,
					identityPoolId: authProperties.identity_pool_id,
				},
			};
		} else {
			config.Auth = {
				Cognito: {
					userPoolId: authProperties.user_pool_id,
					userPoolClientId: authProperties.user_pool_client_id,
				},
			};
		}

		if (authProperties.password_policy) {
			config.Auth.Cognito.passwordFormat = {
				requireLowercase: authProperties.password_policy?.require_lowercase,
				requireNumbers: authProperties.password_policy?.require_numbers,
				requireUppercase: authProperties.password_policy?.require_uppercase,
				requireSpecialCharacters:
					authProperties.password_policy?.require_symbols,
				minLength: authProperties.password_policy?.min_length ?? 6,
			};
		}

		if (authProperties.mfa_configuration) {
			config.Auth.Cognito.mfa = {
				status: getMfaStatus(authProperties.mfa_configuration),
				smsEnabled: authProperties.mfa_methods?.some(
					method => method === 'SMS',
				),
				totpEnabled: authProperties.mfa_methods?.some(
					method => method === 'TOTP',
				),
			};
		}

		if (authProperties.unauthenticated_identities_enabled) {
			config.Auth.Cognito.allowGuestAccess =
				authProperties.unauthenticated_identities_enabled;
		}

		config.Auth.Cognito.loginWith = {};

		if (hasOAuthConfig(authProperties)) {
			config.Auth.Cognito.loginWith!.oauth = {
				domain: authProperties.oauth!.domain,
				redirectSignIn: authProperties.oauth!.redirect_sign_in_uri,
				redirectSignOut: authProperties.oauth!.redirect_sign_out_uri,
				responseType: authProperties.oauth!.response_type,
				scopes: authProperties.oauth!.scopes,
				providers: getOAuthProviders(authProperties.oauth!.identity_providers),
			};
		}

		if (authProperties.user_verification_mechanisms) {
			if (authProperties.username_attributes?.some(user => user === 'EMAIL')) {
				config.Auth.Cognito.loginWith.email = true;
			}

			if (
				authProperties.username_attributes?.some(
					user => user === 'PHONE_NUMBER',
				)
			) {
				config.Auth.Cognito.loginWith.phone = true;
			}

			if (
				authProperties.username_attributes?.some(user => user === 'USERNAME')
			) {
				config.Auth.Cognito.loginWith.username = true;
			}
		}

		if (authProperties.standard_required_attributes) {
			config.Auth.Cognito.userAttributes =
				authProperties.standard_required_attributes.reduce(
					(acc, curr) => ({ ...acc, [curr]: { required: true } }),
					{},
				);
		}

		if (!config.Auth.Cognito.loginWith) {
			delete config.Auth.Cognito.loginWith;
		}
	}

	if (gen2Config.analytics) {
		const analyticsProperties = gen2Config.analytics;

		if (analyticsProperties.amazon_pinpoint) {
			const Pinpoint = {
				appId: analyticsProperties.amazon_pinpoint.app_id,
				region: analyticsProperties.amazon_pinpoint.aws_region,
			};
			if (!config.Analytics) {
				config.Analytics = {
					Pinpoint,
				};
			} else {
				config.Analytics!.Pinpoint = Pinpoint;
			}
		}
	}

	if (gen2Config.geo) {
		const geoProperties = gen2Config.geo;
		config.Geo = {
			LocationService: {
				region: geoProperties.aws_region,
				searchIndices: geoProperties.search_indices,
				geofenceCollections: geoProperties.geofence_collections,
				maps: geoProperties.maps,
			},
		};
	}

	if (gen2Config.data) {
		const dataConfig = gen2Config.data;

		const GraphQL: APIGraphQLConfig = {
			endpoint: dataConfig.url,
			defaultAuthMode: getGraphQLAuthMode(
				dataConfig.default_authorization_type,
			),
			region: dataConfig.aws_region,
			apiKey: dataConfig.api_key,
			modelIntrospection: dataConfig.model_introspection,
		};

		if (!config.API) {
			config.API = {
				GraphQL,
			};
		} else {
			config.API.GraphQL = GraphQL;
		}
	}

	if (gen2Config.notifications) {
		const notificationConfig = gen2Config.notifications;

		if (notificationConfig.channels.in_app_messaging) {
			const InAppMessaging = {
				Pinpoint: {
					appId: notificationConfig.pinpoint_app_id,
					region: notificationConfig.aws_region,
				},
			};
			if (!config.Notifications) {
				config.Notifications = {
					InAppMessaging,
				};
			} else {
				config.Notifications.InAppMessaging = InAppMessaging;
			}
		}
		if (notificationConfig.channels.apns || notificationConfig.channels.fcm) {
			const PushNotification = {
				Pinpoint: {
					appId: notificationConfig.pinpoint_app_id,
					region: notificationConfig.aws_region,
				},
			};

			if (!config.Notifications) {
				config.Notifications = {
					PushNotification,
				};
			} else {
				config.Notifications.PushNotification = PushNotification;
			}
		}
	}

	return config;
}

function getGraphQLAuthMode(authType: AuthType): GraphQLAuthMode {
	switch (authType) {
		case 'AMAZON_COGNITO_USER_POOLS':
			return 'userPool';
		case 'API_KEY':
			return 'apiKey';
		case 'AWS_IAM':
			return 'iam';
		case 'AWS_LAMBDA':
			return 'lambda';
		case 'OPENID_CONNECT':
			return 'oidc';
		default:
			throw new Error('Invalid AuthMode configured');
	}
}

function getOAuthProviders(
	providers?: Gen2OAuthIdentityProviders[],
): OAuthProvider[] {
	const oauthProviders: OAuthProvider[] = [];
	providers?.forEach(provider => {
		if (provider === 'GOOGLE') {
			oauthProviders.push('Google');
		}
		if (provider === 'LOGIN_WITH_AMAZON') {
			oauthProviders.push('Amazon');
		}
		if (provider === 'FACEBOOK') {
			oauthProviders.push('Facebook');
		}
		if (provider === 'SIGN_IN_WITH_APPLE') {
			oauthProviders.push('Apple');
		}
	});

	return oauthProviders;
}

// TODO: create a type guard for oauth config
function hasOAuthConfig(authProperties: Gen2AuthProperties): boolean {
	return !!authProperties.oauth;
}

function getMfaStatus(
	mfaConfiguration: Gen2AuthMFAConfiguration,
): CognitoUserPoolConfigMfaStatus {
	if (mfaConfiguration === 'OPTIONAL') return 'optional';
	if (mfaConfiguration === 'REQUIRED') return 'on';

	return 'off';
}
