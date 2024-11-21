// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { COGNITO_IDENTITY_PROVIDERS } from '../constant';

import { getSearchParamValueFromUrl } from './getSearchParamValueFromUrl';

export const resolveIdentityProviderFromUrl = (urlStr: string): string | null =>
	resolveProvider(getSearchParamValueFromUrl(urlStr, 'provider'));

const resolveProvider = (provider: string | null): string | null => {
	if (!provider) {
		return null;
	}

	return COGNITO_IDENTITY_PROVIDERS[capitalize(provider)] ?? provider;
};

const capitalize = (value: string) =>
	`${value[0].toUpperCase()}${value.substring(1)}`;
