// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthServiceOptions } from '..';

export type ConfirmResetPasswordRequest<
	ServiceOptions extends AuthServiceOptions
> = {
	username: string;
	newPassword: string;
	confirmationCode: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};
