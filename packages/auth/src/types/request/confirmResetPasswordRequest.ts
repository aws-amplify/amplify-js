// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPluginOptions } from '../models';

export type ConfirmResetPasswordRequest<
	PluginOptions extends AuthPluginOptions = AuthPluginOptions
> = {
	username: string;
	newPassword: string;
	code: string;
	options?: { pluginOptions?: PluginOptions }
};
