// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_PART_SIZE, MAX_PARTS_COUNT } from '../../../utils/constants';

export const calculatePartSize = (totalSize?: number): number => {
	if (!totalSize) {
		return DEFAULT_PART_SIZE;
	}
	let partSize = DEFAULT_PART_SIZE;
	let partsCount = Math.ceil(totalSize / partSize);
	while (partsCount > MAX_PARTS_COUNT) {
		partSize *= 2;
		partsCount = Math.ceil(totalSize / partSize);
	}
	return partSize;
};
