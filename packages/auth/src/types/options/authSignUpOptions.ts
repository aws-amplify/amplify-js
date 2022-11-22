import { AuthPluginOptions, AuthUserAttribute, AuthUserAttributeKey } from '../models';

export type AuthSignUpOptions<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	PluginOptions extends AuthPluginOptions = AuthPluginOptions
> = {
	userAttributes: AuthUserAttribute<UserAttributeKey>[];
	options?: { pluginOptions?: PluginOptions };
};