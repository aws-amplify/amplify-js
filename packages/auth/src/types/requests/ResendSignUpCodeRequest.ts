// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPluginOptions } from '../../providers/cognito/types/options/AuthPluginOptions';
import { CognitoResendSignUpCodeOptions } from '../../providers/cognito/types/options/CognitoResendSignUpCodeOptions';

/**
 * The parameters for constructing a Resend Sign Up code request.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param options - optional parameters for the Sign Up process such as the plugin options
 */
export type ResendSignUpCodeRequest<
	PluginOptions extends CognitoResendSignUpCodeOptions = AuthPluginOptions
> = {
	username: string;
	options?: { pluginOptions?: PluginOptions };
};
