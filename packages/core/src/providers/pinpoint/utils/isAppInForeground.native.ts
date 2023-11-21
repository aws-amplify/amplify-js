// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(eslint): remove this linter suppression.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: missing type definition
import { AppState } from 'react-native';

export const isAppInForeground = () => AppState.currentState === 'active';
