// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OAuthResponseType } from './oAuthResponseType';

export type OAuth = {
	domain: string;
	scope: string[];
	redirectSignIn: string;
	redirectSignOut: string;
	responseType: OAuthResponseType;
};
