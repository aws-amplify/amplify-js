import { OAuthProvider } from './libraryUtils';
import {
	APIGraphQLConfig,
	APIRestConfig,
	GraphQLAuthMode,
} from './singleton/API/types';
import { AuthType, Gen2AuthProperties } from './singleton/gen2/types';
import { Gen2Config, LegacyConfig, ResourcesConfig } from './singleton/types';

export function isGen2Config(
	resourceConfig: ResourcesConfig | LegacyConfig | Gen2Config,
): resourceConfig is Gen2Config {
	return !!(resourceConfig as Gen2Config).$id;
}

export function parseGen2Config(resourceConfig: Gen2Config): ResourcesConfig {
	const config: ResourcesConfig = {};

	if (resourceConfig?.storage) {
		const storageProperties = resourceConfig.storage;
		config.Storage = {
			S3: {
				bucket: storageProperties.name,
				region: storageProperties.aws_region,
			},
		};
	}

	if (resourceConfig?.auth) {
		const authProperties = resourceConfig.auth;

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
				domain: authProperties.oauth_domain!,
				redirectSignIn: authProperties.oauth_redirect_sign_in!,
				redirectSignOut: authProperties.oauth_redirect_sign_out!,
				responseType: authProperties.oauth_response_type!,
				scopes: authProperties.oauth_scopes!,
				providers: getOAuthProviders(authProperties.identity_providers),
			};
		}

		if (authProperties.user_verification_mechanisms) {
			if (
				authProperties.user_verification_mechanisms.some(
					user => user === 'EMAIL',
				)
			) {
				config.Auth.Cognito.loginWith.email = true;
			}

			if (
				authProperties.user_verification_mechanisms.some(
					user => user === 'PHONE',
				)
			) {
				config.Auth.Cognito.loginWith.phone = true;
			}

			if (
				authProperties.user_verification_mechanisms.some(
					user => user === 'USERNAME',
				)
			) {
				config.Auth.Cognito.loginWith.username = true;
			}
		}

		if (authProperties.standard_attributes) {
			config.Auth.Cognito.userAttributes = authProperties.standard_attributes;
		}

		if (config.Auth.Cognito.loginWith) {
			delete config.Auth.Cognito.loginWith;
		}
	}

	if (resourceConfig.analytics) {
		const analyticsProperties = resourceConfig.analytics;

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

		if (analyticsProperties.amazon_kinesis) {
			const Kinesis = {
				region: analyticsProperties.amazon_kinesis.aws_region,
				bufferSize: analyticsProperties.amazon_kinesis.buffer_size,
				flushInterval: analyticsProperties.amazon_kinesis.flush_interval,
				flushSize: analyticsProperties.amazon_kinesis.flush_size,
				resendLimit: analyticsProperties.amazon_kinesis.resend_limit,
			};

			if (!config.Analytics) {
				config.Analytics = {
					Kinesis,
				};
			} else {
				config.Analytics!.Kinesis = Kinesis;
			}
		}

		if (analyticsProperties.amazon_kinesis_firehose) {
			const KinesisFirehose = {
				region: analyticsProperties.amazon_kinesis_firehose.aws_region,
				bufferSize: analyticsProperties.amazon_kinesis_firehose.buffer_size,
				flushInterval:
					analyticsProperties.amazon_kinesis_firehose.flush_interval,
				flushSize: analyticsProperties.amazon_kinesis_firehose.flush_size,
				resendLimit: analyticsProperties.amazon_kinesis_firehose.resend_limit,
			};

			if (!config.Analytics) {
				config.Analytics = {
					KinesisFirehose,
				};
			} else {
				config.Analytics!.KinesisFirehose = KinesisFirehose;
			}
		}
	}

	if (resourceConfig.geo) {
		const geoProperties = resourceConfig.geo;
		config.Geo = {
			LocationService: {
				region: geoProperties.aws_region,
				searchIndices: geoProperties.search_indices,
				geofenceCollections: geoProperties.geofence_collections,
			},
		};

		const mapItems = geoProperties.maps?.items.reduce(
			(acc, item) => {
				acc[item.name] = item.style;

				return acc;
			},
			{} as Record<string, string>,
		);
		if (mapItems && geoProperties.maps?.default) {
			config.Geo!.LocationService.maps = {
				default: geoProperties.maps.default,
				items: mapItems,
			};
		}
	}

	if (resourceConfig.api) {
		const apiProperties = resourceConfig.api;
		const endpoints: Record<string, APIRestConfig> =
			apiProperties.endpoints?.reduce(
				(acc, item) => {
					acc[item.name] = {
						endpoint: item.url,
						region: item.aws_region,
						service: 'execute-api',
					};

					return acc;
				},
				{} as Record<string, APIRestConfig>,
			);
		config.API = {
			REST: { ...endpoints },
		};
	}

	if (resourceConfig.data) {
		const dataConfig = resourceConfig.data;

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

	if (resourceConfig.notifications) {
		const notificationConfig = resourceConfig.notifications;

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
	providers?: string[],
): (OAuthProvider | { custom: string })[] {
	const oauthProviders: (OAuthProvider | { custom: string })[] = [];
	providers?.forEach(provider => {
		if (
			provider === 'Google' ||
			provider === 'Amazon' ||
			provider === 'Facebook' ||
			provider === 'Apple'
		) {
			oauthProviders.push(provider);
		} else {
			oauthProviders.push({
				custom: provider,
			});
		}
	});

	return oauthProviders;
}

// TODO: create a type guard for oauth config
function hasOAuthConfig(authProperties: Gen2AuthProperties) {
	return (
		!!authProperties.oauth_domain &&
		!!authProperties.oauth_redirect_sign_in &&
		!!authProperties.oauth_redirect_sign_out &&
		!!authProperties.oauth_response_type &&
		!!authProperties.oauth_scopes
	);
}

function getMfaStatus(
	mfaConfiguration: 'OPTIONAL' | 'REQUIRED' | 'NONE',
): 'on' | 'off' | 'optional' {
	if (mfaConfiguration === 'OPTIONAL') return 'optional';
	if (mfaConfiguration === 'REQUIRED') return 'on';
	if (mfaConfiguration === 'NONE') return 'off';

	return 'off';
}
