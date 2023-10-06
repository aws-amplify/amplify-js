// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OpenAuthSession } from './types';

export const openAuthSession: OpenAuthSession = async (url: string) => {
	if (!window?.location) {
		return;
	}
	// enforce HTTPS
	window.location.href = url.replace('http://', 'https://');
};
