import { APIGraphQLConfig, GraphQLAuthMode } from './singleton/API/types';
import {
	CognitoUserPoolConfigMfaStatus,
	OAuthProvider,
} from './singleton/Auth/types';
import {
	AuthType,
	Gen2AuthMFAConfiguration,
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
		/* eslint-disable camelcase */
		const { bucket_name, aws_region } = gen2Config.storage;
		config.Storage = {
			S3: {
				bucket: bucket_name,
				region: aws_region,
			},
		};
	}

	if (gen2Config?.auth) {
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
		} = gen2Config.auth;

		if (identity_pool_id) {
			config.Auth = {
				Cognito: {
					userPoolId: user_pool_id,
					userPoolClientId: user_pool_client_id,
					identityPoolId: identity_pool_id,
				},
			};
		} else {
			config.Auth = {
				Cognito: {
					userPoolId: user_pool_id,
					userPoolClientId: user_pool_client_id,
				},
			};
		}

		if (password_policy) {
			config.Auth.Cognito.passwordFormat = {
				requireLowercase: password_policy.require_lowercase,
				requireNumbers: password_policy.require_numbers,
				requireUppercase: password_policy.require_uppercase,
				requireSpecialCharacters: password_policy.require_symbols,
				minLength: password_policy.min_length ?? 6,
			};
		}

		if (mfa_configuration) {
			config.Auth.Cognito.mfa = {
				status: getMfaStatus(mfa_configuration),
				smsEnabled: mfa_methods?.some(method => method === 'SMS'),
				totpEnabled: mfa_methods?.some(method => method === 'TOTP'),
			};
		}

		if (unauthenticated_identities_enabled) {
			config.Auth.Cognito.allowGuestAccess = unauthenticated_identities_enabled;
		}

		config.Auth.Cognito.loginWith = {};

		if (oauth) {
			config.Auth.Cognito.loginWith.oauth = {
				domain: oauth.domain,
				redirectSignIn: oauth.redirect_sign_in_uri,
				redirectSignOut: oauth.redirect_sign_out_uri,
				responseType: oauth.response_type,
				scopes: oauth.scopes,
				providers: getOAuthProviders(oauth.identity_providers),
			};
		}

		if (username_attributes) {
			if (username_attributes.some(user => user === 'EMAIL')) {
				config.Auth.Cognito.loginWith.email = true;
			}

			if (username_attributes.some(user => user === 'PHONE_NUMBER')) {
				config.Auth.Cognito.loginWith.phone = true;
			}

			if (username_attributes.some(user => user === 'USERNAME')) {
				config.Auth.Cognito.loginWith.username = true;
			}
		}

		if (standard_required_attributes) {
			config.Auth.Cognito.userAttributes = standard_required_attributes.reduce(
				(acc, curr) => ({ ...acc, [curr]: { required: true } }),
				{},
			);
		}

		if (!config.Auth.Cognito.loginWith) {
			delete config.Auth.Cognito.loginWith;
		}
	}

	if (gen2Config.analytics) {
		const { amazon_pinpoint } = gen2Config.analytics;

		if (amazon_pinpoint) {
			const Pinpoint = {
				appId: amazon_pinpoint.app_id,
				region: amazon_pinpoint.aws_region,
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
		const { aws_region, geofence_collections, maps, search_indices } =
			gen2Config.geo;
		config.Geo = {
			LocationService: {
				region: aws_region,
				searchIndices: search_indices,
				geofenceCollections: geofence_collections,
				maps,
			},
		};
	}

	if (gen2Config.data) {
		const {
			aws_region,
			default_authorization_type,
			url,
			api_key,
			model_introspection,
		} = gen2Config.data;

		const GraphQL: APIGraphQLConfig = {
			endpoint: url,
			defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
			region: aws_region,
			apiKey: api_key,
			modelIntrospection: model_introspection,
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
		const { aws_region, channels, pinpoint_app_id } = gen2Config.notifications;

		if (channels.in_app_messaging) {
			const InAppMessaging = {
				Pinpoint: {
					appId: pinpoint_app_id,
					region: aws_region,
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
		if (channels.apns || channels.fcm) {
			const PushNotification = {
				Pinpoint: {
					appId: pinpoint_app_id,
					region: aws_region,
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

function getMfaStatus(
	mfaConfiguration: Gen2AuthMFAConfiguration,
): CognitoUserPoolConfigMfaStatus {
	if (mfaConfiguration === 'OPTIONAL') return 'optional';
	if (mfaConfiguration === 'REQUIRED') return 'on';

	return 'off';
}
