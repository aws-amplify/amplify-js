// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore: missing type definition
import { AppState } from 'react-native';

export const isAppInForeground = () => AppState.currentState === 'active';
