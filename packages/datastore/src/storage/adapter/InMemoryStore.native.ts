// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { loadAsyncStorage } from '@aws-amplify/react-native';

// See: https://react-native-async-storage.github.io/async-storage/
export function createInMemoryStore() {
	return loadAsyncStorage();
}
