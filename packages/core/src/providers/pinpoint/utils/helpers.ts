// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SupportedCategory } from '../types';

const PROVIDER_NAME = 'pinpoint';

export const getCacheKey = (appId: string, category: SupportedCategory): string =>
	`${category}:${PROVIDER_NAME}:${appId}`;
