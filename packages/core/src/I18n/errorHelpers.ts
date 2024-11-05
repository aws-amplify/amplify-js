// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from '../errors';
import { AmplifyErrorMap, AssertionFunction } from '../types';

export enum I18nErrorCode {
	NotConfigured = 'NotConfigured',
}

const i18nErrorMap: AmplifyErrorMap<I18nErrorCode> = {
	[I18nErrorCode.NotConfigured]: {
		message: 'i18n is not configured.',
	},
};

export const assert: AssertionFunction<I18nErrorCode> =
	createAssertionFunction(i18nErrorMap);
