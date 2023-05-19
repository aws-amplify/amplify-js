// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthServiceOptions } from '../options/AuthServiceOptions';

/**
 * The parameters for constructing a Resend Sign Up code request.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param options - optional parameters for the Sign Up process such as the plugin options
 */
export type ResendSignUpCodeRequest<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	options?: { serviceOptions?: ServiceOptions };
};
