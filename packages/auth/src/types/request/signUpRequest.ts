import { AuthPluginOptions, AuthUserAttributeKey } from '../models';
import { AuthSignUpOptions } from '../options';

export type SignUpRequest<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	PluginOptions extends AuthPluginOptions = AuthPluginOptions
> = {
	username: string;
	password: string;
	options?: AuthSignUpOptions<UserAttributeKey, PluginOptions>;
};