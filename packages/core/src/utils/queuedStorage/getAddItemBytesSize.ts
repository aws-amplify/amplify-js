// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ItemToAdd } from './types';

export const getAddItemBytesSize = ({
	content,
	timestamp,
}: ItemToAdd): number => content.length + timestamp.length + 8;
