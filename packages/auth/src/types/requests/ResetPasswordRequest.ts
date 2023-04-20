// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthServiceOptions } from '../options/AuthServiceOptions';

export type ResetPasswordRequest<
	ServiceOptions extends AuthServiceOptions
> = {
	username: string;
	options?: {
		serviceOptions?: ServiceOptions
	};
};
