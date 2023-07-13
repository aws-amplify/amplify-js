// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Adapter } from '..';
import AsyncStorageAdapter from '../AsyncStorageAdapter';

const getDefaultAdapter: () => Adapter = () => {
	return AsyncStorageAdapter;
};

export default getDefaultAdapter;
