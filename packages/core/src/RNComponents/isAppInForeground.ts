// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppState } from '.';

export const isAppInForeground = () => {
	return AppState.currentState === 'active';
};
