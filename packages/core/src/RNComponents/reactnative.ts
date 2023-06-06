// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Linking, AppState } from 'react-native';
import { MMKV } from 'react-native-mmkv';
const Storage = new MMKV();
export { Linking, AppState, Storage };
