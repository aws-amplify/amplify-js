// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthServiceOptions } from '../options/AuthServiceOptions';

export type SignInRequest<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password?: string;
	options?: { serviceOptions?: ServiceOptions };
};
