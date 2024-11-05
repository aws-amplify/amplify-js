// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import AsyncStorage from '@react-native-async-storage/async-storage';

// See: https://react-native-async-storage.github.io/async-storage/
export function createInMemoryStore() {
	return AsyncStorage;
}
