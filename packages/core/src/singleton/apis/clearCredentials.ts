// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getActiveContext } from '../../context/globalContext';

export function clearCredentials(): Promise<void> {
	return getActiveContext().clearCredentials();
}
