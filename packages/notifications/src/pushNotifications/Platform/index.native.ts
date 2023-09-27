// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform as NativePlatform } from 'react-native';
import { Platform as PlatformInterface } from './types';

const { OS } = NativePlatform;

export const Platform: PlatformInterface = { OS };
