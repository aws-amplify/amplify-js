import { AuthPluginOptions } from '../../providers/cognito/types/models/AuthPluginOptions';
import { CognitoResendSignUpCodeOptions } from '../../providers/cognito/types/models/CognitoResendSignUpCodeOptions';

export type ResendSignUpCodeRequest<
	PluginOptions extends CognitoResendSignUpCodeOptions = AuthPluginOptions
> = {
	username: string;
	options?: { pluginOptions?: PluginOptions };
};
