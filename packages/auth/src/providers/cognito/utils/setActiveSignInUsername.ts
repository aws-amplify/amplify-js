// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signInStore } from '../../../client/utils/store';

export function setActiveSignInUsername(username: string) {
	const { dispatch } = signInStore;

	dispatch({ type: 'SET_USERNAME', value: username });
}
