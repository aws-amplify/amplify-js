// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthPluginOptions } from '../..';

export type ResendSignUpCodeRequest<
	PluginOptions extends AuthPluginOptions = AuthPluginOptions
> = {
	username: string;
	options?: { pluginOptions?: PluginOptions };
};
