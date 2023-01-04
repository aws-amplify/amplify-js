// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPluginOptions } from '../models';

export type ResetPasswordRequest<PluginOptions extends AuthPluginOptions = AuthPluginOptions> = {
	username: string,
	options?: { pluginOptions?: PluginOptions }
};
