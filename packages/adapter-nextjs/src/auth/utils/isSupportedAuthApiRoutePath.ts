// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SUPPORTED_ROUTES } from '../constant';
import { SupportedRoutePaths } from '../types';

export function isSupportedAuthApiRoutePath(
	path?: string,
): path is SupportedRoutePaths {
	return (
		path !== undefined && SUPPORTED_ROUTES.includes(path as SupportedRoutePaths)
	);
}
