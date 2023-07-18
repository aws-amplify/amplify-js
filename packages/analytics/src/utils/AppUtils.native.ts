// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AppState } from 'react-native';

const isAppInForeground = () => {
	return AppState.currentState === 'active';
};

export { isAppInForeground };
