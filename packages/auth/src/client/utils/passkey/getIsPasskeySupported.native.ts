// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnPasskeys } from '@aws-amplify/react-native';

export const getIsPasskeySupported = () => {
	return loadAmplifyRtnPasskeys().getIsPasskeySupported();
};
