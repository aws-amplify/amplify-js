// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPluginOptions, AuthUserAttribute, AuthUserAttributeKey } from '../models';

export type AuthSignUpOptions<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	PluginOptions extends AuthPluginOptions = AuthPluginOptions
> = {
	userAttributes: AuthUserAttribute<UserAttributeKey>[];
	options?: { pluginOptions?: PluginOptions };
};
